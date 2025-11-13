// src/hooks/useImageEditor.js
import { useState, useCallback } from 'react'
import { editImage } from '../services/avatarService'

export function useImageEditor(initialImage) {
  const [currentImage, setCurrentImage] = useState(initialImage)
  const [originalImage] = useState(initialImage)
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasChanges, setHasChanges] = useState(false)

  const handleEditImage = useCallback(async (prompt, options = {}) => {
    if (!prompt.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await editImage(
        currentImage, 
        prompt,
        {
          negative_prompt: options.negative_prompt || 'blur, distortion, darkness, noise',
          steps: options.steps || 20,
          guidance: options.guidance || 7.5,
          ...options
        }
      )

      const newImage = response.image_url

      const newHistory = [...history.slice(0, historyIndex + 1), { 
        image: newImage, 
        prompt 
      }]
      
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
      setCurrentImage(newImage)
      setHasChanges(true)

      return newImage
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [currentImage, history, historyIndex])

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setCurrentImage(history[newIndex].image)
      setHasChanges(true)
    } else if (historyIndex === 0) {
      setHistoryIndex(-1)
      setCurrentImage(originalImage)
      setHasChanges(false)
    }
  }, [historyIndex, history, originalImage])

  const discard = useCallback(() => {
    setCurrentImage(originalImage)
    setHistory([])
    setHistoryIndex(-1)
    setHasChanges(false)
    setError(null)
  }, [originalImage])

  const canUndo = historyIndex >= 0

  return {
    currentImage,
    originalImage,
    history,
    historyIndex,
    isLoading,
    error,
    hasChanges,
    canUndo,
    editImage: handleEditImage,
    undo,
    discard
  }
}