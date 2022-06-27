---
title: "ECSタスクで動かしているバッチのエラーを通知してみよう"
date: "2022-06-13"
---

ECSタスクで動かしているバッチが異常終了した時にエラー通知をしてみる。

[Amazon EventBridge のイベントパターン](https://docs.aws.amazon.com/ja_jp/eventbridge/latest/userguide/eb-event-patterns.html)を作る。

~~~
{
  "source": ["aws.ecs"],
  "detail-type": ["ECS Task State Change"],
  "detail": {
    "clusterArn": ["arn:aws:ecs:ap-northeast-1:************:cluster/*******-dev"],
    "lastStatus": ["STOPPED"],
    "containers": {
      "exitCode": [ { "anything-but": 0} ]
    }
  }
}
~~~

これで監視してやれば、異常終了時にイベントを送ることができる。

AWS lambda でイベントをキャッチして、slack に通知を送ってみよう。

`node` 環境で書く。ライブラリに依存せずに動かしたいので `https` でリクエストを送る。

~~~js
var https = require('https');
var util = require('util');

var POST_OPTIONS = {
    hostname: 'hooks.slack.com',
    path: process.env.slack_webhook_url,
    method: 'POST',
};

exports.handler = function(input, context) {
    console.log(input);
    console.log(context);

    var message = {
        username: "AWSエラー",
        icon_emoji: ":japanese_goblin:"
    };
    
    var log_group_url = "https://ap-northeast-1.console.aws.amazon.com/cloudwatch/home?region=ap-northeast-1#logsV2:log-groups/log-group/" + encodeURIComponent(context['logGroupName']);
    message['text'] = "ECSタスクが強制終了しました。\n" + log_group_url

    var r = https.request(POST_OPTIONS, function(res) {
        res.setEncoding('utf8');
        res.on('data', function(data) {
            context.succeed("Message Sent: " + data);
        });
    }).on("error", function(e) { context.fail("Failed: " + e); });
    r.write(util.format("%j", message));
    r.end();
};
~~~

# おまけ

Rails アプリケーション内から通知を送るパターン。

`attachments_text` にはスタックトレースを入れたり。長くなると勝手に畳んでくれるので便利。

~~~rb
class SlackClient
  require 'net/http'
  require 'uri'
  require 'json'

  def post(message, attachments_text = nil)
    uri = URI.parse(Rails.application.credentials.dig(:webhook_url))
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.start do
      request = Net::HTTP::Post.new(uri.path)
      request.set_form_data(payload: payload(message, attachments_text).to_json)
      http.request(request)
    end
  end

  private

  def payload(message, attachments_text)
    res = {
      username: "アプリケーションエラー",
      icon_emoji: ":ghost:",
      text: Rails.env + "環境で、" + message
    }
    if attachments_text
      res[:attachments] = [
        {
          text: attachments_text
        }
      ]
    end
    return res
  end
end 
~~~