const fs = require('fs');

// Function to calculate text width with a given font size and family
const calculateTextWidth = (text, fontSize = 16, fontFamily = 'Arial') => {
  // Approximate width calculation for text
  const canvas = require('canvas');
  const { createCanvas } = canvas;
  const canvasInstance = createCanvas(1, 1);
  const context = canvasInstance.getContext('2d');
  context.font = `${fontSize}px ${fontFamily}`;
  return context.measureText(text).width;
};

// Function to calculate text segments based on pause threshold and screen width
const calculateSegments = (words, pauseThreshold, maxWidth, fontSize, fontFamily) => {
  const segments = [];
  let currentSegment = [];
  let currentText = '';
  let lastEndTime = 0;
  let currentSegmentWidth = 0;

  words.forEach(word => {
    // Check if we need to start a new segment
    if (word.start - lastEndTime > pauseThreshold) {
      if (currentSegment.length > 0) {
        // Check if current segment fits within the screen width
        const segmentText = currentSegment.map(w => w.word).join(' ');
        const segmentWidth = calculateTextWidth(segmentText, fontSize, fontFamily);

        // If the segment width exceeds the maximum width, split the segment
        if (segmentWidth > maxWidth) {
          let tempSegment = [];
          let tempWidth = 0;

          currentSegment.forEach(w => {
            const wordWidth = calculateTextWidth(w.word, fontSize, fontFamily);
            if (tempWidth + wordWidth > maxWidth) {
              segments.push({ text: tempSegment.map(w => w.word).join(' '), words: tempSegment });
              tempSegment = [w];
              tempWidth = wordWidth;
            } else {
              tempSegment.push(w);
              tempWidth += wordWidth;
            }
          });

          if (tempSegment.length > 0) {
            segments.push({ text: tempSegment.map(w => w.word).join(' '), words: tempSegment });
          }
        } else {
          segments.push({ text: segmentText, words: currentSegment });
        }
      }

      // Start a new segment
      currentSegment = [];
      currentText = '';
    }

    currentSegment.push(word);
    lastEndTime = word.end;
  });

  if (currentSegment.length > 0) {
    // Check if the last segment fits within the screen width
    const segmentText = currentSegment.map(w => w.word).join(' ');
    const segmentWidth = calculateTextWidth(segmentText, fontSize, fontFamily);

    // If the segment width exceeds the maximum width, split the segment
    if (segmentWidth > maxWidth) {
      let tempSegment = [];
      let tempWidth = 0;

      currentSegment.forEach(w => {
        const wordWidth = calculateTextWidth(w.word, fontSize, fontFamily);
        if (tempWidth + wordWidth > maxWidth) {
          segments.push({ text: tempSegment.map(w => w.word).join(' '), words: tempSegment });
          tempSegment = [w];
          tempWidth = wordWidth;
        } else {
          tempSegment.push(w);
          tempWidth += wordWidth;
        }
      });

      if (tempSegment.length > 0) {
        segments.push({ text: tempSegment.map(w => w.word).join(' '), words: tempSegment });
      }
    } else {
      segments.push({ text: segmentText, words: currentSegment });
    }
  }

  return segments;
};

// Example usage
const words = [
  { "word": "Myopia", "start": 0.18, "end": 0.7 },
  { "word": "also", "start": 0.94, "end": 1.38 },
  { "word": "known", "start": 1.38, "end": 1.5 },
  { "word": "as", "start": 1.5, "end": 1.78 },
  { "word": "nearsightedness", "start": 1.78, "end": 2.52 },
  { "word": "is", "start": 2.84, "end": 2.9 },
  { "word": "a", "start": 2.9, "end": 3.12 },
  { "word": "vision", "start": 3.12, "end": 3.36 },
  { "word": "condition", "start": 3.36, "end": 3.82 },
  { "word": "in", "start": 3.82, "end": 4.22 },
  { "word": "which", "start": 4.22, "end": 4.4 },
  { "word": "people", "start": 4.4, "end": 4.66 },
  { "word": "can", "start": 4.66, "end": 5 },
  { "word": "see", "start": 5, "end": 5.18 },
  { "word": "close", "start": 5.18, "end": 5.5 },
  { "word": "objects", "start": 5.5, "end": 5.88 },
  { "word": "clearly", "start": 5.88, "end": 6.38 },
  { "word": "but", "start": 6.7, "end": 6.9 },
  { "word": "blurred", "start": 6.9, "end": 7.14 },
  { "word": "for", "start": 7.14, "end": 7.44 },
  { "word": "far", "start": 7.44, "end": 7.64 },
  { "word": "object", "start": 7.64, "end": 8.22 },
  { "word": "At", "start": 9.36, "end": 9.44 },
  { "word": "age", "start": 9.44, "end": 9.76 },
  { "word": "7", "start": 9.76, "end": 10.02 },
  { "word": "to", "start": 10.02, "end": 10.18 },
  { "word": "13", "start": 10.18, "end": 10.68 },
  { "word": "this", "start": 11, "end": 11.14 },
  { "word": "is", "start": 11.14, "end": 11.3 },
  { "word": "when", "start": 11.3, "end": 11.4 },
  { "word": "our", "start": 11.4, "end": 11.7 },
  { "word": "myopia", "start": 11.7, "end": 11.96 },
  { "word": "develops", "start": 11.96, "end": 12.46 },
  { "word": "the", "start": 12.46, "end": 12.72 },
  { "word": "fastest", "start": 12.72, "end": 13.2 },
  { "word": "and", "start": 13.5, "end": 13.68 },
  { "word": "after", "start": 13.68, "end": 13.88 },
  { "word": "that", "start": 13.88, "end": 14.34 },
  { "word": "stabilizes", "start": 14.72, "end": 15.16 },
  { "word": "or", "start": 15.46, "end": 15.78 },
  { "word": "worsens", "start": 15.78, "end": 16.18 },
  { "word": "This", "start": 17.32, "end": 17.54 },
  { "word": "is", "start": 17.54, "end": 17.76 },
  { "word": "why", "start": 17.76, "end": 17.9 },
  { "word": "it", "start": 17.9, "end": 18.02 },
  { "word": "is", "start": 18.02, "end": 18.16 },
  { "word": "so", "start": 18.16, "end": 18.46 },
  { "word": "important", "start": 18.46, "end": 18.74 },
  { "word": "to", "start": 18.74, "end": 19.1 },
  { "word": "treat", "start": 19.1, "end": 19.2 },
  { "word": "them", "start": 19.2, "end": 19.36 },
  { "word": "at", "start": 19.36, "end": 19.54 },
  { "word": "an", "start": 19.54, "end": 19.8 },
  { "word": "early", "start": 19.8, "end": 19.96 },
  { "word": "age", "start": 19.96, "end": 20.4 },
  { "word": "So", "start": 21.56, "end": 21.82 },
  { "word": "this", "start": 22.1, "end": 22.24 },
  { "word": "is", "start": 22.24, "end": 22.36 },
  { "word": "the", "start": 22.36, "end": 22.52 },
  { "word": "best", "start": 22.52, "end": 22.76 },
  { "word": "time", "start": 22.76, "end": 23 },
  { "word": "for", "start": 23, "end": 23.2 },
  { "word": "us", "start": 23.2, "end": 23.32 },
  { "word": "to", "start": 23.32, "end": 23.7 },
  { "word": "handle", "start": 23.7, "end": 23.7 },
  { "word": "this", "start": 23.7, "end": 24.02 },
  { "word": "issue", "start": 24.02, "end": 24.3 },
  { "word": "Stay", "start": 25.58, "end": 25.76 },
  { "word": "tuned", "start": 25.76, "end": 25.92 },
  { "word": "on", "start": 25.92, "end": 26.14 },
  { "word": "how", "start": 26.14, "end": 26.24 },
  { "word": "we", "start": 26.24, "end": 26.4 },
  { "word": "can", "start": 26.4, "end": 26.56 },
  { "word": "help", "start": 26.56, "end": 26.7 },
  { "word": "your", "start": 26.7, "end": 26.96 },
  { "word": "children", "start": 26.96, "end": 27.2 }
];

const pauseThreshold = 1; // 1 second pause to separate segments
const maxWidth = 300; // maximum width for each segment
const fontSize = 16;
const fontFamily = 'Arial';

// Calculate segments
const segments = calculateSegments(words, pauseThreshold, maxWidth, fontSize, fontFamily);

console.log(JSON.stringify(segments, null, 2));