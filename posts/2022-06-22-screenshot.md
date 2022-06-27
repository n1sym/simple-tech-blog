---
title: "puppeteer-ruby でgif画像のスクショを撮る"
date: "2022-06-22"
---

rails アプリで gif画像のスクショを撮って保存するメモ。

[puppeteer-ruby](https://github.com/YusukeIwaki/puppeteer-ruby) を使います。

前提：Dockerfile に `chromium` 、Gemfile に `puppeteer-ruby` を追加

サンプルコード
~~~rb
  def screenshot(image_url)
    store_path = "app/assets/images/screenshot.png"
    Puppeteer.launch(headless: true, args: ['--no-sandbox']) do |browser|
      page = browser.new_page
      page.goto(image_url)
      page.query_selector("img")&.evaluate("node => node.style.width = '100%'")
      page.screenshot(path: store_path)
    end
  end
~~~
