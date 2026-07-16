import { useState, useEffect } from 'react';
import ReportFormHeader from './ReportFormHeader';
import HazardDetailsInputs from './HazardDetailsInputs';
import LocationInputs from './LocationInputs';
import PhotoUploadInput from './PhotoUploadInput';
import FormActions from './FormActions';

import { fetchAddress } from '../../Functions/Report/geocoding';
import { getGPSLocation } from '../../Functions/Report/gpsHelper';
import { readPhotoAsBase64 } from '../../Functions/Report/photoHelper';

export default function ReportForm({ selectedLocation, onClose, onSubmit, userLocation }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('jalanan_rusak');
  const [description, setDescription] = useState('');
  const [hazardLevel, setHazardLevel] = useState('medium');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [photo, setPhoto] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync coords from map selection or GPS
  useEffect(() => {
    if (selectedLocation) {
      setLatitude(selectedLocation.lat.toFixed(6));
      setLongitude(selectedLocation.lng.toFixed(6));
    } else if (userLocation) {
      setLatitude(userLocation.lat.toFixed(6));
      setLongitude(userLocation.lng.toFixed(6));
    }
  }, [selectedLocation, userLocation]);

  // Geocoding lookup
  useEffect(() => {
    if (!latitude || !longitude) return;

    const lookupAddress = async () => {
      const address = await fetchAddress(latitude, longitude);
      setDisplayName(address);
    };

    const timer = setTimeout(lookupAddress, 600);
    return () => clearTimeout(timer);
  }, [latitude, longitude]);

  // Read file and convert to Base64
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    readPhotoAsBase64(file, setPhoto);
  };

  const handleUseGPS = () => {
    if (userLocation) {
      setLatitude(userLocation.lat.toFixed(6));
      setLongitude(userLocation.lng.toFixed(6));
    } else {
      getGPSLocation(
        (coords) => {
          setLatitude(coords.latitude);
          setLongitude(coords.longitude);
        },
        (err) => {
          alert('Gagal mendapatkan lokasi GPS Anda: ' + err.message);
        }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return alert('Judul laporan tidak boleh kosong.');
    if (!latitude || !longitude) return alert('Koordinat lokasi diperlukan. Klik di peta atau gunakan GPS.');

    setIsSubmitting(true);
    try {
      await onSubmit({
        title,
        type,
        description,
        hazard_level: hazardLevel,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        display_name: displayName,
        photo_url: photo || null,
        upvotes: 0,
        downvotes: 0,
        status: 'pending'
      });
      onClose();
    } catch (err) {
      alert('Gagal mengirimkan laporan: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="futuristic-panel w-full max-h-[90vh] overflow-y-auto rounded-lg p-4 pointer-events-auto border-t-2" style={{ borderTopColor: 'var(--accent-color)' }}>
      <ReportFormHeader onClose={onClose} />
      <form onSubmit={handleSubmit} className="space-y-3.5 text-sm text-slate-700">
        <HazardDetailsInputs
          title={title}
          setTitle={setTitle}
          displayName={displayName}
          setDisplayName={setDisplayName}
          type={type}
          setType={setType}
          hazardLevel={hazardLevel}
          setHazardLevel={setHazardLevel}
          description={description}
          setDescription={setDescription}
        />
        <PhotoUploadInput
          photo={photo}
          setPhoto={setPhoto}
          onPhotoChange={handlePhotoChange}
        />
        <LocationInputs
          latitude={latitude}
          setLatitude={setLatitude}
          longitude={longitude}
          setLongitude={setLongitude}
          onUseGPS={handleUseGPS}
        />
        <FormActions onClose={onClose} isSubmitting={isSubmitting} />
      </form>
    </div>
  );
}
