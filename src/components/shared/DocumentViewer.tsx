/**
 * Document Viewer Component
 * Simple browser-native document viewing
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiDownload, FiFileText, FiImage } from "react-icons/fi";

interface DocumentViewerProps {
  url: string;
  filename: string;
  fileType: "pdf" | "image" | "unknown";
  onClose: () => void;
}

const DocumentViewer = ({
  url,
  filename,
  fileType,
  onClose,
}: DocumentViewerProps) => {
  const [imageZoomed, setImageZoomed] = useState(false);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    window.open(url, "_blank");
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-100000 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              {fileType === "image" ? (
                <FiImage className="w-5 h-5 text-blue-600" />
              ) : (
                <FiFileText className="w-5 h-5 text-gray-600" />
              )}
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {filename}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <FiDownload className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-auto max-h-[calc(90vh-120px)] flex items-center justify-center bg-gray-50">
            {fileType === "image" ? (
              <img
                src={url}
                alt={filename}
                className={`max-w-full max-h-[70vh] rounded-lg shadow-lg cursor-zoom-in transition-transform ${
                  imageZoomed ? "scale-150" : ""
                }`}
                onClick={() => setImageZoomed(!imageZoomed)}
              />
            ) : fileType === "pdf" ? (
              <iframe
                src={url}
                title={filename}
                className="w-full h-[calc(90vh-120px)] rounded-lg border border-gray-200"
                style={{ minHeight: "600px" }}
              />
            ) : (
              <div className="text-center py-12">
                <FiFileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  This file type cannot be previewed here.
                </p>
                <button
                  onClick={handleOpenInNewTab}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Open in New Tab
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DocumentViewer;
