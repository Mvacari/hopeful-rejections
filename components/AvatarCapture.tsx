'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { updateUserAvatar } from '@/lib/db/client-mutations'

interface AvatarCaptureProps {
  userId: string
  currentAvatar?: string | null
  onComplete: (avatarUrl: string) => void
}

export default function AvatarCapture({ userId, currentAvatar, onComplete }: AvatarCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentAvatar || null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 640 },
        audio: false,
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsCapturing(true)
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Unable to access camera. Please check permissions.')
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    // Set canvas size to square
    const size = Math.min(video.videoWidth, video.videoHeight)
    canvas.width = size
    canvas.height = size

    // Draw centered square crop
    const offsetX = (video.videoWidth - size) / 2
    const offsetY = (video.videoHeight - size) / 2
    ctx.drawImage(video, offsetX, offsetY, size, size, 0, 0, size, size)

    // Stop camera
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    // Convert to blob and upload
    canvas.toBlob(async (blob) => {
      if (!blob) return

      const supabase = createClient()
      const fileExt = 'jpg'
      const fileName = `${userId}/${Date.now()}.${fileExt}`
      const filePath = fileName

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: true,
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        return
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const previewUrl = data.publicUrl
      setPreview(previewUrl)
      setIsCapturing(false)

      // Update user profile
      await updateUserAvatar(userId, previewUrl)
      onComplete(previewUrl)
    }, 'image/jpeg', 0.9)
  }

  const cancelCapture = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsCapturing(false)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {preview && !isCapturing && (
        <div className="relative">
          <img
            src={preview}
            alt="Avatar preview"
            className="w-32 h-32 rounded-full object-cover border-4 border-primary-400"
          />
        </div>
      )}

      {isCapturing ? (
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-64 h-64 rounded-full object-cover border-4 border-primary-400"
            />
            <div className="absolute inset-0 rounded-full border-4 border-white pointer-events-none" />
          </div>
          <div className="flex gap-4">
            <button
              onClick={capturePhoto}
              className="px-6 py-3 bg-primary-500 text-white rounded-full font-semibold hover:bg-primary-600 transition-colors"
            >
              Capture
            </button>
            <button
              onClick={cancelCapture}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={startCamera}
          className="px-6 py-3 bg-primary-500 text-white rounded-full font-semibold hover:bg-primary-600 transition-colors"
        >
          {preview ? 'Change Photo' : 'Take Selfie'}
        </button>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
