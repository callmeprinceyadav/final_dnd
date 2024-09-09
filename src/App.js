import React, { useState, useEffect } from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { Button, TextField, Box, Typography, Grid } from '@mui/material';
import './App.css';
import { db } from './firebase'; // Import Firestore

import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore'; // Firestore functions

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
  const [layout, setLayout] = useState([]);
  const [layoutName, setLayoutName] = useState('');

  useEffect(() => {
    // Load layout from Firebase on component mount
    fetchLayoutFromFirebase();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDragEnd = (event) => {
    const { id } = event.active;
    setLayout([...layout, { id }]);
  };

  const saveLayout = async () => {
    if (!layoutName.trim()) {
      alert('Please enter a layout name.');
      return;
    }
  
    try {
      // Save only the layout structure, not Firebase document IDs
      await setDoc(doc(db, 'layouts', layoutName), { layout });
      alert('Layout saved to Firebase!');
    } catch (error) {
      console.error('Error saving layout to Firebase:', error);
      alert('Failed to save layout.');
    }
  };
  

  const fetchLayoutFromFirebase = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'layouts'));
      const layouts = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setLayout(layouts);
    } catch (error) {
      console.error('Error fetching layouts from Firebase:', error);
      alert('Failed to load layouts.');
    }
  };

  const loadLayout = async () => {
    if (!layoutName.trim()) {
      alert('Please enter a layout name.');
      return;
    }

    try {
      const docRef = doc(db, 'layouts', layoutName);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setLayout(docSnap.data().layout);
        alert('Layout loaded from Firebase!');
      } else {
        alert('No layout found with that name.');
      }
    } catch (error) {
      console.error('Error loading layout from Firebase:', error);
      alert('Failed to load layout.');
    }
  };

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
