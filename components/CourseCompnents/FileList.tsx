
import React from 'react';
import type { CourseFile } from '../../types';

interface FileListProps {
  files: CourseFile[];
}

const FileIcon: React.FC<{ type: CourseFile['type'] }> = ({ type }) => {
  const iconClasses = "w-6 h-6 mr-3 text-gray-500";
  switch (type) {
    case 'PDF':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    case 'ZIP':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case 'Image':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    default:
      return null;
  }
};

const FileList: React.FC<FileListProps> = ({ files }) => {
  if (files.length === 0) {
    return <p className="text-gray-500">فایلی برای این دوره وجود ندارد.</p>;
  }

  return (
    <ul className="space-y-3">
      {files.map((file) => (
        <li key={file.id}>
          <a
            href={file.url}
            download
            className="flex items-center p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <FileIcon type={file.type} />
            <span className="flex-1 text-gray-800 font-medium">{file.name}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
};

export default FileList;
