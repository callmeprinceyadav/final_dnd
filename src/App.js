import React, { useState, useEffect } from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { Button, TextField, Box, Typography, Grid } from '@mui/material';
import './App.css';
import { db } from './firebase'; 

import { doc, setDoc, getDoc } from 'firebase/firestore'; 

const Draggable = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

  const style = {
    transform: `translate3d(${transform?.x}px, ${transform?.y}px, 0)`,
    padding: '10px',
    marginBottom: '10px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    backgroundColor: '#f5f5f5',
    cursor: 'grab',
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </div>
  );
};

const Droppable = ({ id, children }) => {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className="droppable-area">
      {children}
    </div>
  );
};

function App() {
  const [layout, setLayout] = useState([]); // Layout state to store draggable items
  const [layoutName, setLayoutName] = useState(''); // Layout name for saving and loading

  useEffect(() => {
    // Clear layout on page refresh or WHen page Loaded 
    setLayout([]);
  }, []); // Runs once when the component mounts and loads

  // Handles the drag and drop event from Left Side To Right Side
  const handleDragEnd = (event) => {
    const { id } = event.active;
    setLayout((prevLayout) => [...prevLayout, { id }]); // Add the dropped item to the layout array
  };

  // Save/Add the current layout to Firebase 
  const saveLayout = async () => {
    if (!layoutName.trim()) {
      alert('Please enter a layout name.');
      return;
    }
  
    try {
      // Check if the layout with the same name already exists
      const docRef = doc(db, 'layouts', layoutName);
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        // Layout with this name already exists, ask for confirmation to overwrite
        const shouldOverwrite = window.confirm(
          'A layout with this name already exists. Do you want to overwrite it?'
        );
        if (!shouldOverwrite) {
          return; // If user chooses not to overwrite, exit the function
        }
      }
  
      // Save the layout to Firebase (overwrite if exists or save as new)
      await setDoc(doc(db, 'layouts', layoutName), { layout });
      alert('Layout saved to Firebase!');
    } catch (error) {
      console.error('Error saving layout to Firebase:', error);
      alert('Failed to save layout.');
    }
  };
  
  // Load a layout from Firebase by its name
  const loadLayout = async () => {
    if (!layoutName.trim()) {
      alert('Please enter a layout name.');
      return;
    }

    try {
      const docRef = doc(db, 'layouts', layoutName);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setLayout(docSnap.data().layout); // Set the retrieved layout to the state
        alert('Layout loaded from Firebase!');
      } else {
        alert('No layout found with that name.');
      }
    } catch (error) {
      console.error('Error loading layout from Firebase:', error);
      alert('Failed to load layout.');
    }
  };

  // Publish the layout in a new browser window in the Form Of Text Only
  const publishPage = () => {
    const newWindow = window.open();
    newWindow.document.write("<html><body><h1>Published Page</h1><div>");
    layout.forEach((item) => {
      newWindow.document.write(`<div>${item.id}</div>`);
    });
    newWindow.document.write("</div></body></html>");
  };

  return (
    <Box className="App">
      <Grid container spacing={2}>
        <Grid item xs={12} md={6} className="left-container">
          <Typography variant="h6">Drag & Drop Controls</Typography>
          <DndContext onDragEnd={handleDragEnd}>
            <Box className="control-panel">
              <Draggable id="Label">Label Component</Draggable>
              <Draggable id="Input">Input Box Component</Draggable>
              <Draggable id="Checkbox">Checkbox Component</Draggable>
              <Draggable id="Button">Button Component</Draggable>
              <Draggable id="Table">Table Component</Draggable>
            </Box>
          </DndContext>
        </Grid>

        <Grid item xs={12} md={6} className="right-container">
          <TextField
            label="Enter Layout Name"
            variant="outlined"
            fullWidth
            className="search-box"
            margin="normal"
            value={layoutName}
            onChange={(e) => setLayoutName(e.target.value)}
          />

          <Box className="action-buttons" display="flex" justifyContent="space-between" mb={2}>
            <Button variant="contained" color="primary" onClick={saveLayout}>
              Save Layout
            </Button>
            <Button variant="contained" color="secondary" onClick={loadLayout}>
              Load Layout
            </Button>
            <Button variant="contained" color="success" onClick={publishPage}>
              Publish
            </Button>
          </Box>

          <Droppable id="drop-zone">
            <Typography variant="h6">Drop Zone</Typography>
            {layout.map((item, index) => (
              <div key={index} className="dropped-item">
                {item.id}
              </div>
            ))}
          </Droppable>
        </Grid>
      </Grid>
    </Box>
  );
}

export default App;
