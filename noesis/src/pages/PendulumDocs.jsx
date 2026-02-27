import { useState } from "react";

const pdfPath = '/documentation/physics/pendulum.pdf'

export default function PendulumDocs(){
    return (<iframe
      src={`${pdfPath}#toolbar=0&navpanes=0&view=FitH`}
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh', 
        border: 'none',
        zIndex: 9999 
      }}
    />
)
}