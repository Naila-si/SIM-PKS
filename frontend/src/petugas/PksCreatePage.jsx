import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ModalTambahPks } from './ModalTambahPks';

export const PksCreatePage = () => {
  const navigate = useNavigate();

  return (
    <ModalTambahPks
      isOpen={true}
      onClose={() => navigate('/pks')}
      onSuccess={() => navigate('/pks')}
    />
  );
};
