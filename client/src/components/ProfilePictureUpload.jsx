import { useState, useRef } from 'react';

/**
 * Composant d'upload de photo de profil avec conversion Base64.
 * Supporte l'import depuis le système de fichiers et la capture via webcam.
 * 
 * @param {Object} props
 * @param {string|null} props.currentPicture - URL Base64 actuelle ou null
 * @param {function} props.onPictureChange - Callback avec la chaîne Base64 (ou null pour suppression)
 * @param {string} [props.userName] - Nom de l'utilisateur pour l'avatar fallback
 */
export default function ProfilePictureUpload({ currentPicture, onPictureChange, userName = 'User' }) {
  const [preview, setPreview] = useState(currentPicture || null);
  const [isHovering, setIsHovering] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // ========== IMPORT FICHIER ==========

  const handleFileSelect = (e) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        console.warn('⚠️ Le fichier sélectionné n\'est pas une image');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        console.warn('⚠️ L\'image ne doit pas dépasser 5 Mo');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const base64String = event.target?.result;
          if (typeof base64String === 'string') {
            setPreview(base64String);
            onPictureChange(base64String);
            console.log('✅ Image importée et convertie en Base64');
          }
        } catch (err) {
          console.error('❌ Erreur lors de la lecture du fichier :', err);
        }
      };
      reader.onerror = () => {
        console.error('❌ Erreur FileReader :', reader.error);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('❌ Erreur handleFileSelect :', error);
    }
  };

  // ========== CAPTURE WEBCAM ==========

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      setShowCamera(true);

      // Attendre le rendu du <video> avant d'y attacher le stream
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(err => {
            console.error('❌ Erreur lecture vidéo :', err);
          });
        }
      }, 100);
    } catch (error) {
      console.error('❌ Erreur accès caméra :', error);
    }
  };

  const captureImage = () => {
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas) {
        console.warn('⚠️ Références vidéo/canvas non disponibles');
        return;
      }

      // Dimensions exactes de la vidéo
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Conversion en Base64 avec compression JPEG qualité 0.6
      const base64String = canvas.toDataURL('image/jpeg', 0.6);

      setPreview(base64String);
      onPictureChange(base64String);
      console.log('✅ Image capturée et convertie en Base64 (JPEG q=0.6)');

      // Fermer la caméra
      stopCamera();
    } catch (error) {
      console.error('❌ Erreur captureImage :', error);
    }
  };

  const stopCamera = () => {
    try {
      if (cameraStream) {
        const tracks = cameraStream.getTracks();
        tracks.forEach(track => {
          track.stop();
          console.log('📷 Piste caméra arrêtée :', track.label);
        });
        setCameraStream(null);
      }
      setShowCamera(false);
    } catch (error) {
      console.error('❌ Erreur stopCamera :', error);
    }
  };

  // ========== SUPPRESSION ==========

  const handleRemove = () => {
    try {
      setPreview(null);
      onPictureChange(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      console.log('✅ Photo de profil supprimée');
    } catch (error) {
      console.error('❌ Erreur handleRemove :', error);
    }
  };

  const handleClick = () => {
    try {
      fileInputRef.current?.click();
    } catch (error) {
      console.error('❌ Erreur handleClick :', error);
    }
  };

  // URL de fallback : avatar généré à partir du nom
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=111&color=fff&size=128`;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar / Photo */}
      <div
        className="relative w-24 h-24 rounded-full overflow-hidden cursor-pointer group border-2 border-border hover:border-foreground transition-colors"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={handleClick}
      >
        <img
          src={preview || fallbackAvatar}
          alt="Photo de profil"
          className="w-full h-full object-cover"
        />

        {/* Overlay au survol */}
        <div
          className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
            isHovering ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <span className="text-white text-xs font-medium">Changer</span>
        </div>
      </div>

      {/* Canvas masqué pour la capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Input file caché */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Boutons d'action */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleClick}
          className="px-3 py-1.5 text-xs font-medium rounded-sm bg-surface border border-border text-muted hover:text-strong hover:border-strong transition-colors"
        >
          {preview ? 'Modifier' : 'Ajouter une photo'}
        </button>
        <button
          type="button"
          onClick={openCamera}
          className="px-3 py-1.5 text-xs font-medium rounded-sm bg-surface border border-border text-muted hover:text-strong hover:border-strong transition-colors"
        >
          📷 Prendre une photo
        </button>
        {preview && (
          <button
            type="button"
            onClick={handleRemove}
            className="px-3 py-1.5 text-xs font-medium rounded-sm border border-border text-red-500 hover:text-red-600 hover:border-red-300 transition-colors"
          >
            Supprimer
          </button>
        )}
      </div>

      {/* Modal Caméra */}
      {showCamera && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          onClick={stopCamera}
        >
          <div
            className="bg-surface border border-border rounded-sm p-6 w-full max-w-lg mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-medium text-foreground mb-4">Prendre une photo</h3>

            {/* Lecteur vidéo */}
            <div className="bg-black rounded-sm overflow-hidden mb-4 aspect-video">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            </div>

            {/* Boutons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={captureImage}
                className="flex-1 py-2.5 bg-foreground text-white text-sm font-medium rounded-sm hover:bg-strong transition-colors"
              >
                Capturer l'image
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="flex-1 py-2.5 border border-border text-muted text-sm font-medium rounded-sm hover:text-strong hover:border-strong transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}