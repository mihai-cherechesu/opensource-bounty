import React from 'react';
import { Button, Col, Container, Navbar, Row, Text, User } from "@nextui-org/react"


const FileUploader = props => {    
  const hiddenFileInput = React.useRef(null);

  const handleClick = event => {
    hiddenFileInput.current.click();
  };  
  
  const handleChange = event => {
    const fileUploaded = event.target.files[0];
    props.handleFile(fileUploaded);
  };  
  
  return (
    <>
      <Button
          auto
          flat
          size='sm'
          color='primary'
          onClick={() => handleClick()}
      >
          Register
      </Button>
      <input type="file"
            ref={hiddenFileInput}
            onChange={handleChange}
            style={{display:'none'}} 
      /> 
    </>
  );
};

export default FileUploader;