import * as THREE from 'three';

export const navigateToClient = (client, clientPositionsRef, controlsRef, setFocusedClientId) => {
  const clientData = clientPositionsRef.current.find(c => c.id_cuenta === client.id_cuenta);
  if (!clientData || !controlsRef.current) return;

  setFocusedClientId(client.id_cuenta);

  if (controlsRef.current) {
    controlsRef.current.autoRotate = false;
  }

  const clientPosition = new THREE.Vector3(...clientData.position);
  
  // Calcular dirección desde el centro (0,0,0) hacia el cliente
  const direction = clientPosition.clone().normalize();
  
  // Distancia base de la cámara al cliente
  let distanciaAlCliente = 3.5; // Reducido de 4 a 3.5 para estar más cerca
  
  // Ajustar distancia según posición del cliente para evitar que quede fuera de vista
  const absX = Math.abs(clientPosition.x);
  const absY = Math.abs(clientPosition.y);
  const absZ = Math.abs(clientPosition.z);
  
  // Calcular distancia del cliente al centro
  const distanciaDelCentro = Math.sqrt(absX * absX + absZ * absZ);
  
  // Si el cliente está MUY CERCA del centro, hacer zoom out
  if (distanciaDelCentro < 2) {
    distanciaAlCliente = 5; // Zoom alejado para clientes muy cerca
  }
  // Si el cliente está lejos del centro, zoom moderado
  else if (distanciaDelCentro > 5) {
    distanciaAlCliente = 4.5; // Reducido de 5 a 4.5
  }
  
  // Si el cliente está muy arriba, hacer ZOOM OUT
  if (clientPosition.y > 1.5) {
    distanciaAlCliente = 6; // Reducido de 8 a 6
  } else if (absY > 2) {
    distanciaAlCliente = 4.5; // Reducido de 5 a 4.5
  }
  
  // Posicionar cámara ALEJÁNDOSE del cliente en dirección opuesta al centro
  const newCameraPos = clientPosition.clone().add(
    direction.multiplyScalar(distanciaAlCliente)
  );
  
  // AJUSTE CRÍTICO: Bajar la cámara para que el cliente quede centrado verticalmente
  // La cámara debe estar DEBAJO del cliente para verlo bien
  newCameraPos.y -= 2; // Bajar la cámara 2 unidades para mejor vista
  
  // Ajuste adicional en Y para clientes muy arriba o muy abajo
  if (clientPosition.y > 1.5) {
    newCameraPos.y += 1; // Subir un poco si está muy arriba
  } else if (clientPosition.y < -1.5) {
    newCameraPos.y -= 1; // Bajar más si está muy abajo
  }
  
  // AJUSTE CRÍTICO: Si el cliente está muy a la derecha,
  // mover la cámara MÁS a la derecha para seguirlo y evitar que la etiqueta lo tape
  const estaALaDerecha = clientPosition.x > 3; // Cliente en zona derecha
  const estaALaIzquierda = clientPosition.x < -3; // Cliente en zona izquierda
  const estaArriba = clientPosition.y > 1.5; // Cliente muy arriba
  const estaAbajo = clientPosition.y < -1.5; // Cliente muy abajo
  
  if (estaALaDerecha) {
    // Cliente a la derecha - mover cámara MUCHO MÁS a la derecha
    // para evitar que la etiqueta de resumen lo tape
    newCameraPos.x += 5; // Desplazar 5 unidades a la derecha (aumentado de 3 a 5)
    // Si también está abajo, subir un poco más
    if (estaAbajo) {
      newCameraPos.y += 1;
    }
  } else if (estaALaIzquierda) {
    // Cliente a la izquierda - mover cámara MÁS a la izquierda
    newCameraPos.x -= 3; // Desplazar 3 unidades a la izquierda
  }
  
  // Ajustes verticales adicionales
  if (estaArriba) {
    newCameraPos.y += 1.5; // Subir más para clientes muy arriba
  } else if (estaAbajo && !estaALaDerecha) {
    // Solo si no está a la derecha (ya se ajustó arriba)
    newCameraPos.y -= 1.5; // Bajar más para clientes muy abajo
  }

  // AJUSTAR EL TARGET: Ajustar hacia dónde mira la cámara según la posición del cliente
  const targetPosition = clientPosition.clone();
  
  if (estaALaDerecha) {
    // Mover el punto de mira más a la derecha del cliente
    targetPosition.x += 2; // Mirar 2 unidades más a la derecha
    if (estaAbajo) {
      targetPosition.y += 0.5; // Y un poco más arriba si está abajo
    }
  }
  
  if (estaArriba) {
    // Cliente muy arriba - hacer que la cámara mire MÁS ARRIBA
    targetPosition.y += 1.5; // Mirar 1.5 unidades más arriba del cliente
  }

  // Animar cámara y target
  const startPos = controlsRef.current.object.position.clone();
  const startTarget = controlsRef.current.target.clone();
  
  const duration = 1500; // 1.5 segundos - suave pero no tan lento
  const startTime = Date.now();

  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing EXTRA suave - ease-in-out cuártico (igual que resetCamera)
    const eased = progress < 0.5
      ? 8 * progress * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 4) / 2;

    // Mover la cámara a la nueva posición
    controlsRef.current.object.position.lerpVectors(startPos, newCameraPos, eased);
    
    // El target apunta al cliente (o ajustado si está a la derecha)
    controlsRef.current.target.lerpVectors(startTarget, targetPosition, eased);
    
    controlsRef.current.update();

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };

  animate();
};

export const resetCamera = (controlsRef, setFocusedClientId) => {
  if (!controlsRef.current) return;

  setFocusedClientId(null);
  controlsRef.current.autoRotate = true;

  const startPos = controlsRef.current.object.position.clone();
  const startTarget = controlsRef.current.target.clone();
  const endPos = new THREE.Vector3(0, 2, 5);
  const endTarget = new THREE.Vector3(0, 0, 0);
  
  const duration = 1500; // 1.5 segundos - suave pero no tan lento
  const startTime = Date.now();

  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing EXTRA suave - ease-in-out cuártico (más suave que cúbico)
    const eased = progress < 0.5
      ? 8 * progress * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 4) / 2;

    controlsRef.current.object.position.lerpVectors(startPos, endPos, eased);
    controlsRef.current.target.lerpVectors(startTarget, endTarget, eased);
    controlsRef.current.update();

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };

  animate();
};
