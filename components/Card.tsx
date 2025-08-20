import { Models } from "node-appwrite";
import Link from "next/link";
import { Thumbnail } from "@/components/Thumbnail";
import { convertFileSize } from "@/lib/utils";
import FormattedDateTime from "@/components/FormattedDateTime";
import ActionDropdown from "@/components/ActionDropdown";
import { constructDownloadUrl } from "@/lib/utils";

const Card = ({ file }: { file: Models.Document }) => {
  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const downloadUrl = constructDownloadUrl(file.bucketFileId);
      
      // For larger files like videos, it's better to open in a new tab
      // rather than using blob approach which can memory issues
      if (file.type === 'video' || file.size > 50 * 1024 * 1024) {
        window.open(downloadUrl, '_blank');
      } else {
        // For smaller files, use the blob approach
        const response = await fetch(downloadUrl, {
          credentials: 'include' // Include cookies for authentication
        });
        
        if (!response.ok) throw new Error('Download failed');
        
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      }
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback to opening in new tab
      window.open(constructDownloadUrl(file.bucketFileId), '_blank');
    }
  };

  return (
    <div className="file-card" onClick={handleDownload}>
      <div className="flex justify-between">
        <Thumbnail
          type={file.type}
          extension={file.extension}
          url={file.url}
          className="!size-20"
          imageClassName="!size-11"
        />

        <div className="flex flex-col items-end justify-between">
          <ActionDropdown file={file} />
          <p className="body-1">{convertFileSize(file.size)}</p>
        </div>
      </div>

      <div className="file-card-details">
        <p className="subtitle-2 line-clamp-1">{file.name}</p>
        <FormattedDateTime
          date={file.$createdAt}
          className="body-2 text-light-100"
        />
        <p className="caption line-clamp-1 text-light-200">
          By: {file.owner.fullName}
        </p>
        <button 
          onClick={handleDownload}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Download
        </button>
      </div>
    </div>
  );
};
