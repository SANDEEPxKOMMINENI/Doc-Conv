import { View, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Text } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import * as DocumentPicker from 'expo-document-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { useState } from 'react';
import { FileImage, Share2, Upload, X, Check, Download } from 'lucide-react-native';

const CONVERSION_TYPES = [
  { 
    title: 'HEIC to JPG',
    description: 'Convert Apple HEIC format to universal JPG',
    from: 'heic',
    to: 'jpg',
    color: '#0891b2'
  },
  { 
    title: 'JPG to PNG',
    description: 'Convert JPG to transparent-capable PNG',
    from: 'jpg',
    to: 'png',
    color: '#0d9488'
  },
  { 
    title: 'PNG to JPG',
    description: 'Convert PNG to smaller JPG files',
    from: 'png',
    to: 'jpg',
    color: '#0ea5e9'
  },
  { 
    title: 'WebP to JPG',
    description: 'Convert WebP to widely-supported JPG',
    from: 'webp',
    to: 'jpg',
    color: '#6366f1'
  },
  { 
    title: 'Image Compression',
    description: 'Reduce file size while maintaining quality',
    from: 'any',
    to: 'same',
    color: '#8b5cf6'
  },
  { 
    title: 'Images to PDF',
    description: 'Combine multiple images into a PDF file',
    from: 'images',
    to: 'pdf',
    color: '#ec4899'
  },
];

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1542144582-1ba00456b5e3';

export default function ImageConverterScreen() {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [converting, setConverting] = useState(false);
  const [success, setSuccess] = useState(false);

  const pickImage = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*'],
        multiple: true,
      });

      if (result.assets) {
        setSelectedImages(prev => [...prev, ...result.assets.map(asset => asset.uri)]);
        setSuccess(false);
      }
    } catch (err) {
      console.error('Error picking image:', err);
    }
  };

  const compressImage = async (uri: string) => {
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1200 } }],
        {
          compress: 0.6,
          format: ImageManipulator.SaveFormat.JPEG
        }
      );

      if (Platform.OS !== 'web') {
        await MediaLibrary.saveToLibraryAsync(manipResult.uri);
      } else {
        const response = await fetch(manipResult.uri);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'compressed-image.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }

      return manipResult.uri;
    } catch (err) {
      console.error('Error compressing image:', err);
      throw err;
    }
  };

  const convertToPDF = async () => {
    if (selectedImages.length === 0) return;

    setConverting(true);
    try {
      // First compress all images
      const compressedImages = await Promise.all(
        selectedImages.map(uri => compressImage(uri))
      );

      if (Platform.OS === 'web') {
        // For web, we'll use jsPDF
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF();
        
        for (let i = 0; i < compressedImages.length; i++) {
          const imgData = await fetch(compressedImages[i]).then(r => r.blob());
          const reader = new FileReader();
          
          await new Promise((resolve) => {
            reader.onload = async () => {
              if (i > 0) doc.addPage();
              const imgProps = doc.getImageProperties(reader.result as string);
              const pdfWidth = doc.internal.pageSize.getWidth();
              const pdfHeight = doc.internal.pageSize.getHeight();
              const imgWidth = imgProps.width;
              const imgHeight = imgProps.height;
              
              let finalWidth = pdfWidth;
              let finalHeight = (imgHeight * pdfWidth) / imgWidth;
              
              if (finalHeight > pdfHeight) {
                finalHeight = pdfHeight;
                finalWidth = (imgWidth * pdfHeight) / imgHeight;
              }
              
              const x = (pdfWidth - finalWidth) / 2;
              const y = (pdfHeight - finalHeight) / 2;
              
              doc.addImage(reader.result as string, 'JPEG', x, y, finalWidth, finalHeight);
              resolve(null);
            };
            reader.readAsDataURL(imgData);
          });
        }
        
        doc.save('converted-images.pdf');
      }

      setSuccess(true);
    } catch (err) {
      console.error('Error converting to PDF:', err);
      alert('Failed to convert images to PDF');
    } finally {
      setConverting(false);
    }
  };

  const convertImage = async (from: string, to: string) => {
    if (selectedImages.length === 0) return;

    setConverting(true);
    try {
      if (to === 'pdf') {
        await convertToPDF();
      } else if (from === 'any') {
        // Compression
        await Promise.all(selectedImages.map(uri => compressImage(uri)));
      } else {
        // Regular image conversion
        const manipResult = await ImageManipulator.manipulateAsync(
          selectedImages[0],
          [{ resize: { width: 1200 } }],
          {
            compress: 0.8,
            format: to === 'png' ? ImageManipulator.SaveFormat.PNG : ImageManipulator.SaveFormat.JPEG
          }
        );

        if (Platform.OS !== 'web') {
          await MediaLibrary.saveToLibraryAsync(manipResult.uri);
        } else {
          const response = await fetch(manipResult.uri);
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `converted-image.${to}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }
      }

      setSuccess(true);
    } catch (err) {
      console.error('Error converting image:', err);
      alert('Failed to convert image');
    } finally {
      setConverting(false);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setSuccess(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Image Converter</Text>
        <Text style={styles.subtitle}>Convert your images to any format</Text>
      </View>
      
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.grid}>
          {CONVERSION_TYPES.map((type, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.conversionOption,
                { backgroundColor: type.color },
                converting && styles.disabledOption
              ]}
              onPress={() => convertImage(type.from, type.to)}
              disabled={selectedImages.length === 0 || converting}>
              <FileImage size={24} color="#ffffff" />
              <Text style={styles.optionTitle}>{type.title}</Text>
              <Text style={styles.optionDescription}>{type.description}</Text>
              {converting && (
                <View style={styles.loadingOverlay}>
                  <Text style={styles.loadingText}>Converting...</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
          horizontal
          style={styles.previewScroll}
          contentContainerStyle={styles.previewScrollContent}>
          {selectedImages.map((uri, index) => (
            <View key={index} style={styles.previewContainer}>
              <ExpoImage
                source={{ uri }}
                style={styles.preview}
                contentFit="cover"
              />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeImage(index)}>
                <X size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
          
          <TouchableOpacity 
            style={styles.uploadButton} 
            onPress={pickImage}
            disabled={converting}
            activeOpacity={0.8}>
            <Upload size={32} color="#0891b2" />
            <Text style={styles.uploadTitle}>Add Images</Text>
            <Text style={styles.uploadSubtitle}>Click to select</Text>
          </TouchableOpacity>
        </ScrollView>

        {success && (
          <View style={styles.successBanner}>
            <Check size={20} color="#ffffff" />
            <Text style={styles.successText}>Conversion Complete!</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  conversionOption: {
    padding: 20,
    borderRadius: 16,
    margin: 8,
    width: Platform.OS === 'web' ? '31%' : '46%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  disabledOption: {
    opacity: 0.7,
  },
  optionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  optionDescription: {
    color: '#ffffff',
    fontSize: 13,
    opacity: 0.9,
    lineHeight: 18,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  previewScroll: {
    marginTop: 24,
  },
  previewScrollContent: {
    paddingRight: 16,
    gap: 16,
  },
  previewContainer: {
    width: 200,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  preview: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f1f5f9',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButton: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  uploadTitle: {
    marginTop: 16,
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '600',
  },
  uploadSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#64748b',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22c55e',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  successText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});