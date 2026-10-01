import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ModalUbahPks } from './ModalUbahPks';

export const PksEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <ModalUbahPks
      isOpen={true}
      pksId={id}
      onClose={() => navigate('/pks')}
      onSuccess={() => navigate('/pks')}
    />
  );
};
