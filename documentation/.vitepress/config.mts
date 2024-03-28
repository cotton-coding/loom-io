import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "loom-io",
  description: "loom your file handling",
  lastUpdated: true,
  themeConfig: {
    logo: "/loom-io.png",
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Documentation', link: '/core/intro' }
    ],
    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Introduction', link: '/core/intro' },
          { text: 'Install', link: '/core/install' },
          { text: 'Overview', link: '/core/overview' },
          { text: 'Directory', link: '/core/directory' },
          { text: 'File', link: '/core/file' },
          { text: 'Editor', link: '/core/editor' }
        ]
      },
      {
        text: 'Source Adapter',
        items: [
          { text: 'In-Memory', link: '/adapter/in-memory-adapter' },
          { text: 'Filesystem (node)', link: '/adapter/node-fs-adapter' },
          { text: 'S3-Minio', link: '/adapter/minio-s3-adapter' }
        ]
      },
      {
        text: 'Converter',
        items: [
          { text: 'JSON', link: '/converter/markdown-converter' },
          { text: 'YAML', link: '/converter/yaml-converter' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/cotton-coding/loom-io' }
    ]
  }
})
