import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Máy Tính Tài Chính Cá Nhân',
    short_name: 'Máy Tính Tài Chính',
    description: 'Công cụ lập kế hoạch tài chính cá nhân miễn phí. Tính toán mục tiêu tự do tài chính, theo dõi tiết kiệm, đầu tư và hình dung lộ trình tài chính của bạn.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3b82f6',
    icons: [
      {
        src: '/logo.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  }
}
