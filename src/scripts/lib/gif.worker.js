/**
 * GIF Worker
 *
 * Web worker for processing GIF frames
 */

// Listen for messages from the main thread
self.onmessage = function (e) {
  const data = e.data;
  const frame = data.frame;
  const index = data.index;

  // Process the frame (in a real implementation, this would encode the frame)
  // For now, just simulate processing time
  setTimeout(function () {
    // Send the processed frame back to the main thread
    self.postMessage({
      index,
      data: "Processed frame data would be here",
    });
  }, 100);
};
