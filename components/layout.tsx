import Head from 'next/head'
import Link from 'next/link'

export const siteTitle = 'n1sym tech blog'

export default function Layout({
  children,
  home
}: {
  children: React.ReactNode
  home?: boolean
}) {
  return (
    <div>
      <Head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.5.0/styles/base16/github.min.css"/>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.5.0/highlight.min.js"></script>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="description"
          content="Learn how to build a personal website using Next.js"
        />
        <meta name="og:title" content={siteTitle} />
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no"></meta>
      </Head>
      <header>
        <>
          <h2>
            <Link href="/">
              <a>{siteTitle}</a>
            </Link>
          </h2>
        </>
      </header>
      <main>{children}</main>
      {!home && (
        <div>
          <Link href="/">
            <a>← Back to home</a>
          </Link>
          <div><br></br></div>
        </div>
      )}
      <footer>
        <Link href="https://twitter.com/n1sym">
          <a>{"twitter/n1sym"}</a>
        </Link>
      </footer>
    </div>
  )
}
