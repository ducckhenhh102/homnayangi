import React, { useState } from 'react';
import { Upload, X, CheckCircle2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import Button from './Button';
import { fetchApi } from '../../utils/api';

const MAX_SIZE_MB = 5;

export default function ImageUpload({ token, onUploadSuccess, currentImageUrl, endpoint = null }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(currentImageUrl || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedResult, setUploadedResult] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setError(null);

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(selected.type)) {
      setError('Chỉ chấp nhận file ảnh định dạng JPEG, PNG hoặc WebP.');
      return;
    }

    // Validate size (5MB)
    if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Kích thước ảnh tối đa là ${MAX_SIZE_MB}MB.`);
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setUploadedResult(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      setError(null);

      // 1. Get upload signature from backend (admin endpoint or public submission endpoint)
      const signatureEndpoint = endpoint || (token ? '/admin/uploads/signature?type=restaurant' : '/submissions/upload-signature');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const sigRes = await fetchApi(signatureEndpoint, {
        method: 'POST',
        headers,
      });

      const { signature, timestamp, apiKey, cloudName, folder } = sigRes.data;

      // 2. Direct upload to Cloudinary API
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('folder', folder);

      const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!cloudRes.ok) {
        const errorData = await cloudRes.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || 'Upload ảnh lên Cloudinary thất bại.');
      }

      const cloudData = await cloudRes.json();

      const result = {
        cloudinaryPublicId: cloudData.public_id,
        secureUrl: cloudData.secure_url,
        width: cloudData.width,
        height: cloudData.height,
      };

      setUploadedResult(result);
      if (onUploadSuccess) {
        onUploadSuccess(result);
      }
    } catch (err) {
      console.error('Lỗi upload ảnh:', err);
      setError(err.message || 'Lỗi trong quá trình upload ảnh.');
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    setUploadedResult(null);
    setError(null);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-[#252525]">
        Ảnh đại diện quán (Cloudinary CDN)
      </label>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-[#C73535] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {preview ? (
        <div className="relative aspect-[4/3] max-w-sm rounded-2xl overflow-hidden border border-[#EAE5DF] bg-neutral-100 group">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />

          <button
            type="button"
            onClick={handleClear}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {uploadedResult ? (
            <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-xs p-2 rounded-xl text-xs font-semibold text-[#27865A] flex items-center gap-1.5 shadow-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>Đã tải lên Cloudinary thành công!</span>
            </div>
          ) : (
            <div className="absolute bottom-2 left-2 right-2">
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="w-full"
                onClick={handleUpload}
                isLoading={uploading}
              >
                <Upload className="w-3.5 h-3.5 mr-1.5" />
                Xác nhận tải lên Cloudinary
              </Button>
            </div>
          )}
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#EAE5DF] rounded-2xl cursor-pointer hover:border-[#FF6B4A] transition-colors bg-neutral-50/50">
          <div className="w-12 h-12 rounded-2xl bg-[#FF6B4A]/10 text-[#FF6B4A] flex items-center justify-center mb-2">
            <ImageIcon className="w-6 h-6" />
          </div>
          <span className="text-sm font-semibold text-[#252525]">Bấm để chọn file ảnh</span>
          <span className="text-xs text-[#6B6B6B] mt-1">JPEG, PNG, WebP (tối đa 5MB)</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}
