
import React from 'react';
import type { CourseVideo } from '../../types';

interface VideoPlayerProps {
  video: CourseVideo | null;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ video }) => {
  if (!video) {
    return (
      <div className="aspect-video w-full flex items-center justify-center bg-gray-200 rounded-lg shadow-md">
        <p className="text-gray-500">ویدیویی برای نمایش انتخاب نشده است.</p>
      </div>
    );
  }

  if (video.type === 'aparat') {
    const embedUrl = `https://www.aparat.com/video/video/embed/videohash/${video.url}/vt/frame`;
    return (
      <div className="aspect-video w-full">
        <iframe
          src={embedUrl}
          title={video.title}
          allow="autoplay; encrypted-media"
          allowFullScreen
          className="w-full h-full rounded-lg shadow-md"
        ></iframe>
      </div>
    );
  }
  
  if (video.type === 'google-drive') {
    const embedUrl = `https://drive.google.com/file/d/${video.url}/preview`;
    return (
      <div className="aspect-video w-full">
        <iframe
          src={embedUrl}
          title={video.title}
          allow="autoplay"
          allowFullScreen
          className="w-full h-full rounded-lg shadow-md"
        ></iframe>
      </div>
    );
  }

  // Default to 'direct'
  return (
    <div className="aspect-video w-full">
      <video
        key={video.url} // Key helps React to re-mount the component on source change
        controls
        preload="metadata"
        className="w-full h-full rounded-lg shadow-md bg-black"
        title={video.title}
      >
        <source src={video.url} type="video/mp4" />
        مرورگر شما از تگ ویدیو پشتیبانی نمی‌کند.
      </video>
    </div>
  );
};

export default VideoPlayer;