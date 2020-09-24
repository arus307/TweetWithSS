let media_id = '';
let media_data_url = '';
const content = `
<textarea id="tweet-text" class="form-control tweet-text"></textarea>
<div class="row ope-row">
  <div class="col-6 pl-1">
    <label class="checkbox-inline ml-2 check-attach">
      <input type="checkbox" name="isTweetSS" class="check-lg" checked> スクショを添付
    </label>
  </div>
  <div class="col-2 text-center">
    <span class="text-length">0</span>
  </div>
  <div class="col-4 parent">
    <button id="tweet" class="btn btn-sm m-1 btn-primary">ツイート</button>
  </div>
</div>
`

/**
 * Login logic.
 */
Twitter.isLoggedIn(function (items) {
    if (!items.oauth_token || !items.oauth_token_secret) {
        document.getElementById('authenticate').addEventListener('click', function () {
            Twitter.authenticate();
        })
    } else {

        setUserData();

        setImage();

        document.getElementById('content').innerHTML = content;

        document.getElementById('tweet').addEventListener('click', function () {
            tweet();
        });

        //ツイートにバリデーションを追加
        addTweetValidate();

    }
});

function tweet() {

    let tweet = document.getElementById('tweet-text').value;

    let validate = twttr.txt.parseTweet(tweet);

    if (validate.valid == false) {
        //不正
        //通知を表示
        $('#tweet-invalid-toast').toast().toast('show');

        return;
    }

    let json = {
        status: tweet
    };

    var isTweetWithSS = document.querySelector("input[name='isTweetSS']").checked;
    if (isTweetWithSS && media_data_url != '') {
        postMediaTweet(json);
    } else {
        postTweet(json);
    }

}


function postMediaTweet(json) {

    chrome.storage.local.get(['media_data_url'], function (items) {
        if (items.media_data_url) {

            let b64Text = media_data_url.replace('data:image/png;base64,', '');

            //upload
            Twitter.uploadApi('media/upload', 'POST', { media_data: b64Text }, function (response) {
                media_id = response.media_id_string;

                json.media_ids = [media_id];

                postTweet(json);
            });

        }

    });

}

function postTweet(json) {
    Twitter.api('statuses/update', 'POST', json, function () {

        //通知を表示
        $('#tweet-toast').toast().toast('show');

        //ツイート後処理
        document.getElementById('tweet-text').value = "";

        //画像を削除
        chrome.storage.local.remove(['media_id', 'media_data_url']);
        removeImage();
    })
}

//storageからmedia_data_urlを取り出し、
//存在すればscreenshot-areaにimgタグを追加/なければ削除
function setImage() {

    let screenshot = '';

    chrome.storage.local.get(['media_data_url'], function (items) {
        if (items.media_data_url) {
            media_data_url = items.media_data_url;
            screenshot = '<img class="screenshot-preview" src="' + media_data_url + '">';
        } else {
            screenshot = '';
        }

        document.getElementById('screenshot-area').innerHTML = screenshot;

    });
}

//スクリーンショットエリアを空にする
function removeImage() {
    console.log("removeImage();");
    document.getElementById('screenshot-area').innerHTML = '';
}

function setUserData() {

    Twitter.setUserData();

    let userdata = '';

    chrome.storage.local.get(['user_profile_image_url', 'user_name', 'user_screen_name'], function (items) {

        if (items.user_profile_image_url) {
            user_profile_image_url = items.user_profile_image_url;
            userdata += '<img src="' + items.user_profile_image_url + '" class="user-icon" align="left">';
        }

        if (items.user_name) {
            userdata += ' <span class="ml-1 user-name">' + items.user_name + '</span>';
        }

        if (items.user_screen_name) {
            userdata += '<br> <span class="text-muted user-screen-name">@' + items.user_screen_name + '</span>';
        }

        userdata += '<a class="option-btn" href="'+chrome.extension.getURL("options.html")+'"  target="_blank" rel="noopener noreferrer"><img class="icon-wrench" src="' + chrome.extension.getURL("icons/wrench.svg")+'" ></a>'

        userdata += '<button id="logout" class="btn btn-sm btn-danger">ログアウト</button>';

        document.getElementById('user-info').innerHTML = userdata;

        //ログアウトボタン
        document.getElementById('logout').addEventListener('click', function () {
            Twitter.logout();
            //画面更新
            location.reload();
        });

    });

}

function addTweetValidate() {
    $('#tweet-text')
        .on('input', function () {
            //ツイートテキスト変更時の処理
            validateTweet();
        });

    $("input[name='isTweetSS']")
        .on('input',function(){
            validateTweet();
        });
}

//toastの表示/非表示に合わせてクラスを切り替え(z-index)
$('.toast')
    .on('show.bs.toast', function () {
        this.classList.add('toast-showing');
    })
    .on('hidden.bs.toast', function () {
        this.classList.remove('toast-showing');
    });

function validateTweet() {
    let tweet = document.getElementById("tweet-text").value;
    let validate = twttr.txt.parseTweet(tweet);
    let length = validate.weightedLength;

    var isAttachSS = document.querySelector("input[name='isTweetSS']").checked;

    let elemLength = document.getElementsByClassName("text-length")[0];

    elemLength.innerHTML = length / 2;

    let tweetBtn = document.getElementById('tweet');

    //0文字でも画像添付があれば有効なツイート
    if (validate.valid || (length == 0 && isAttachSS)) {
        elemLength.classList.add("valid");
        elemLength.classList.remove("invalid");

        tweetBtn.removeAttribute('disabled');
    } else {
        elemLength.classList.add("invalid");
        elemLength.classList.remove("valid");

        tweetBtn.setAttribute("disabled","disabled");
    }

}