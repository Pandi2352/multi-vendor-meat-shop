import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus, ArrowLeft } from 'lucide-react';
import { Button, EmptyState, Spinner, toast } from '@/components/ui';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { useAddresses, useDeleteAddress, useSetDefaultAddress } from '../api/use-addresses';
import type { SavedAddress } from '../api/addresses.api';
import { AddressCard } from '../components/address-card';
import { AddressModal } from '../components/address-modal';

export function AddressesPage() {
  useDocumentTitle('Saved Addresses');
  const navigate = useNavigate();
  const { data: addresses = [], isLoading } = useAddresses();
  const deleteMutation = useDeleteAddress();
  const setDefaultMutation = useSetDefaultAddress();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const handleEdit = (addr: SavedAddress) => {
    setEditingAddress(addr);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    setActionId(id);
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Address removed from your address book');
    } catch {
      toast.error('Failed to remove address');
    } finally {
      setActionId(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    setActionId(id);
    try {
      await setDefaultMutation.mutateAsync(id);
      toast.success('Primary delivery address updated');
    } catch {
      toast.error('Failed to update primary address');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 w-full space-y-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs text-muted hover:text-text font-medium"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold text-text flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <span>Saved Delivery Addresses</span>
          </h1>
          <p className="text-xs text-muted mt-1">
            Manage your delivery locations for 1-tap checkout across Virudhunagar district
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleAddNew}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Add New Address
        </Button>
      </div>

      {isLoading ? (
        <div className="py-16 flex justify-center">
          <Spinner />
        </div>
      ) : addresses.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No saved addresses yet"
          description="Add your home or work address for seamless neighbourhood meat delivery."
          actionLabel="Add Your First Address"
          onAction={handleAddNew}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSetDefault={handleSetDefault}
              isDeleting={actionId === address.id && deleteMutation.isPending}
              isSettingDefault={actionId === address.id && setDefaultMutation.isPending}
            />
          ))}
        </div>
      )}

      <AddressModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAddress(null);
        }}
        addressToEdit={editingAddress}
      />
    </div>
  );
}
