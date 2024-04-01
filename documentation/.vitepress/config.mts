import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "loom-io",
  description: "weave your data access",
  lastUpdated: true,
  themeConfig: {
    logo: "/loom-io.png",
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Docs', link: '/core/intro' }
    ],
    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Introduction', link: '/core/intro' },
          { text: 'Setup', link: '/core/setup' },
          { text: 'Examples', link: '/core/examples' }
        ]
      },
      {
        text: 'Source Adapter',
        items: [
          { text: 'In-Memory', link: '/adapter/in-memory-adapter' },
          { text: 'Filesystem', link: '/adapter/node-filesystem-adapter' },
          { text: 'S3-Minio', link: '/adapter/minio-s3-adapter' }
        ]
      },
      {
        text: 'Converter',
        items: [
          { text: 'JSON', link: '/converter/json-converter' },
          { text: 'YAML', link: '/converter/yaml-converter' }
        ]
      },
      {
        text: 'Reference',
        items: [
          { text: 'File', link: '/ref/file' },
          { text: 'Directory', link: '/ref/directory' },
          { text: 'List', link: '/ref/list'},
          { text: 'Editor', link: '/ref/editor' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/cotton-coding/loom-io' }
    ]
  }
})
