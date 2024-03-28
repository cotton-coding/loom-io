import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "loom-io",
  description: "loom your file handling",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Documentation', link: '/introduction' }
    ],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Introduction', link: '/intro' },
          { text: 'Install', link: '/install' },
          { text: 'First steps', link: '/getting-started' }
        ]
      },
      {
        text: 'Source Adapter',
        items: [
          { text: 'In-Memory', link: '/adapter/in-memory-adapter' },
          { text: 'Filesystem (node)', link: '/adapter/node-fs-adapter' },
          { text: 'S3', link: '/adapter/minio-s3-adapter' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/cotton-coding/loom-io' }
    ]
  }
})
