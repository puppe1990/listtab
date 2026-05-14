import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ConfirmModal } from '../ConfirmModal';

describe('ConfirmModal', () => {
  it('should not render when isOpen is false', () => {
    render(
      <ConfirmModal
        isOpen={false}
        title="Delete?"
        message="Are you sure?"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    expect(screen.queryByText('Delete?')).not.toBeInTheDocument();
  });

  it('should render title and message when isOpen is true', () => {
    render(
      <ConfirmModal
        isOpen={true}
        title="Remove tab?"
        message="Remove GitHub from this session?"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    expect(screen.getByText('Remove tab?')).toBeInTheDocument();
    expect(
      screen.getByText('Remove GitHub from this session?')
    ).toBeInTheDocument();
  });

  it('should call onCancel when cancel button clicked', () => {
    const handleCancel = vi.fn();
    render(
      <ConfirmModal
        isOpen={true}
        title="Remove tab?"
        message="Are you sure?"
        onConfirm={() => {}}
        onCancel={handleCancel}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  it('should call onConfirm when confirm button clicked', () => {
    const handleConfirm = vi.fn();
    render(
      <ConfirmModal
        isOpen={true}
        title="Remove tab?"
        message="Are you sure?"
        onConfirm={handleConfirm}
        onCancel={() => {}}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it('should call onCancel when overlay clicked', () => {
    const handleCancel = vi.fn();
    render(
      <ConfirmModal
        isOpen={true}
        title="Remove tab?"
        message="Are you sure?"
        onConfirm={() => {}}
        onCancel={handleCancel}
      />
    );
    fireEvent.click(screen.getByTestId('modal-overlay'));
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  it('should not call onCancel when modal content clicked', () => {
    const handleCancel = vi.fn();
    render(
      <ConfirmModal
        isOpen={true}
        title="Remove tab?"
        message="Are you sure?"
        onConfirm={() => {}}
        onCancel={handleCancel}
      />
    );
    fireEvent.click(screen.getByText('Remove tab?'));
    expect(handleCancel).not.toHaveBeenCalled();
  });
});
