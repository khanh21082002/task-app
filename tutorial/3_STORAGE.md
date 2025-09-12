const uploadImage = async (file: File) => {
  try {
    const fileName = `${auth.user().id}/${task.id}/${file.name}`;
    
    // Upload the image
    const { data, error } = await supabase.storage
      .from("task-attachments")
      .upload(fileName, file, {
        upsert: true,
        contentType: file.type,
        duplex: "half",
        headers: {
          "content-length": file.size.toString(),
        },
      });

    if (error) throw error;
    
    return data;
    
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

const removeImage = async () => {
  try {
    const fileName = `${auth.user().id}/${task.id}/${imageName}`;
    
    // Remove the image
    const { data, error } = await supabase.storage
      .from("task-attachments")
      .remove(fileName);

    if (error) throw error;
    
    return data;
    
  } catch (error) {
    console.error("Error removing image:", error);
    throw error;
  }
};