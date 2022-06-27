---
title: "No file descriptors avaiable エラーの対処"
date: "2022-06-20"
---

redis周りの実装をしていたら `No file descriptors avaiable` というエラーが出てきた。

### ファイルディスクリプタとはなんぞや

[ファイルディスクリプタについて理解する](https://qiita.com/toshihirock/items/78286fccf07dbe6df38f) が参考になった。

### 原因調査

なんでこれが枯渇するんだろうと調べていたら、似たような事象を発見。

[NLB + Fluentd の構成でファイルディスクリプタが枯渇する謎の現象を解消した話 - Repro Tech Blog](https://tech.repro.io/entry/2019/07/03/090000)

> 調査の結果、No file descriptors availableの原因は、次のようになっていることが分かりました。
> 
> - 集約用 Fluentd と転送用 Fluentd もしくはコンテナとの間で確立したコネクションが、何らかの理由でそれらが終了した後もクローズされずに残り続ける
> - そのため、集約用 Fluentd で確立済みのコネクションが増え続け、使用可能なファイルディスクリプタが枯渇する

なるほど。

`netstat -atp`で調べてみると、めっちゃ残ってた。これだ。

~~~txt
bash-5.1# netstat -atp
Active Internet connections (servers and established)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name    
tcp        0      0 0.0.0.0:https           0.0.0.0:*               LISTEN      127/nginx.conf
tcp        0      0 localhost:24224         0.0.0.0:*               LISTEN      -
tcp        0      0 localhost:8877          0.0.0.0:*               LISTEN      -
tcp        0      0 0.0.0.0:http            0.0.0.0:*               LISTEN      127/nginx.conf
tcp        0      0 0.0.0.0:3000            0.0.0.0:*               LISTEN      153/puma.sock) [app
tcp        0      0 ip-10-0-175-214.ap-northeast-1.compute.internal:50932 10.0.162.88:redis       ESTABLISHED 153/puma.sock) [app
tcp        0      0 ip-10-0-175-214.ap-northeast-1.compute.internal:50954 10.0.162.88:redis       ESTABLISHED 153/puma.sock) [app
tcp        0      0 ip-10-0-175-214.ap-northeast-1.compute.internal:51286 10.0.162.88:redis       ESTABLISHED 153/puma.sock) [app
tcp        0      0 ip-10-0-175-214.ap-northeast-1.compute.internal:51318 10.0.162.88:redis       ESTABLISHED 153/puma.sock) [app
tcp        0      0 ip-10-0-175-214.ap-northeast-1.compute.internal:51118 10.0.162.88:redis       ESTABLISHED 153/puma.sock) [app
...
これが数百件続く
...
~~~

### 原因解明

原因は以下だった。

~~~rb
  def redis
     redis = Redis.new(url: "redis://#{ENV['REDIS_URL']}")
  end

  def hogr
    list.each do |fuga|
      redis.sadd("key", fuga)
    end
  end
~~~

ループを回すたびに `Redis` インスタンスを作成しており、それがそのまま残り続けてファイルディスクリプタが枯渇したようだった。という、中々しょうもないオチだった :(

~~~rb
  def redis
     @redis ||= Redis.new(url: "redis://#{ENV['REDIS_URL']}")
  end
~~~

こう書いて解決。