export const uploadVideoForScreening = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('http://127.0.0.1:8000/analyze-video', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Server Error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status === "success") {
      return data; 
    } else {
      throw new Error(data.message || "Analysis failed");
    }
    
  } catch (error) {
    console.error("API Fetch Error:", error);
    throw new Error(error.message || "Cannot connect to the AI Backend.");
  }
};

export const uploadCSVForScreening = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('http://127.0.0.1:8000/analyze-csv', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Server Error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status === "success") {
      return data; 
    } else {
      throw new Error(data.message || "Analysis failed");
    }
    
  } catch (error) {
    console.error("CSV API Fetch Error:", error);
    throw new Error(error.message || "Cannot connect to the AI Backend.");
  }
};

export const uploadJSONForScreening = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('http://127.0.0.1:8000/analyze-json', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Server Error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status === "success") {
      return data; 
    } else {
      throw new Error(data.message || "Analysis failed");
    }
    
  } catch (error) {
    console.error("JSON API Fetch Error:", error);
    throw new Error(error.message || "Cannot connect to the AI Backend.");
  }
};