/**
 * Reads a file as a Base64 data URL
 * @param {File} file 
 * @param {Function} callback 
 */
export function readPhotoAsBase64(file, callback) {
  if (!file) return;
  const reader = new FileReader();
  reader.onloadend = () => {
    callback(reader.result);
  };
  reader.readAsDataURL(file);
}
