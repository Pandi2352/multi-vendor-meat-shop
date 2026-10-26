import { useState, useMemo } from 'react';
import { Plus, Search, Beef, Filter } from 'lucide-react';
import { Button } from '@/components/ui';
import {
  useVendorProducts,
  useCategories,
  useCreateProduct,
  useUpdateProduct,
  useArchiveProduct,
  type VendorProduct,
  type CreateProductPayload,
} from '../api';
import { ProductCard } from '../components/product-card';
import { ProductFormModal } from '../components/product-form-modal';
import { ShopSwitcher } from '@/features/vendor-shops';

export function VendorProductsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<VendorProduct | null>(null);

  const { data: productsData, isLoading } = useVendorProducts();
  const { data: categories = [] } = useCategories();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const archiveMutation = useArchiveProduct();

  const products = productsData?.items || [];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
      const matchesCategory = selectedCategory === 'ALL' || p.categoryId === selectedCategory;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [products, search, statusFilter, selectedCategory]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product: VendorProduct) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleToggleStatus = (product: VendorProduct) => {
    const nextStatus = product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    updateMutation.mutate({
      id: product.id,
      data: { status: nextStatus },
    });
  };

  const handleArchive = (product: VendorProduct) => {
    if (window.confirm(`Are you sure you want to archive "${product.name}"?`)) {
      archiveMutation.mutate(product.id);
    }
  };

  const handleSubmit = (payload: CreateProductPayload) => {
    if (editingProduct) {
      updateMutation.mutate(
        { id: editingProduct.id, data: payload },
        { onSuccess: () => setIsModalOpen(false) }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => setIsModalOpen(false),
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Beef className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-text">Meat Cuts & Daily Catalogue</h1>
          </div>
          <p className="text-xs text-muted mt-1">
            Configure your butcher stall cuts, price per kg, custom package sizes, and prep options
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <ShopSwitcher />
          <Button variant="primary" size="sm" onClick={handleOpenAdd} className="gap-1.5">
            <Plus className="h-4 w-4" />
            <span>Add Meat Cut</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 bg-surface border border-border rounded-md flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          <div className="flex rounded-md border border-border p-0.5 bg-surface-muted">
            {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  statusFilter === tab
                    ? 'bg-surface text-text border border-border'
                    : 'text-muted hover:text-text'
                }`}
              >
                {tab === 'ALL' ? 'All Cuts' : tab === 'ACTIVE' ? 'In Stock' : 'Out of Stock'}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-muted" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1 rounded-md border border-border bg-surface text-text focus:outline-none focus:border-primary"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cut name..."
            className="w-full pl-8 pr-3 py-1 rounded-md border border-border bg-surface text-text focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Grid of Product Cards */}
      {isLoading ? (
        <div className="p-8 text-center text-xs text-muted">Loading catalogue...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-12 text-center rounded-md border border-border bg-surface space-y-3">
          <Beef className="h-10 w-10 text-muted mx-auto" />
          <p className="text-sm font-medium text-text">No meat cuts found</p>
          <p className="text-xs text-muted max-w-sm mx-auto">
            {search || statusFilter !== 'ALL' || selectedCategory !== 'ALL'
              ? 'Try adjusting your filters or search query.'
              : 'Add your first meat cut to start receiving customer orders from your stall.'}
          </p>
          <Button variant="primary" size="sm" onClick={handleOpenAdd} className="mt-2">
            <Plus className="h-4 w-4 mr-1" /> Add Meat Cut
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((p) => {
            const cat = categories.find((c) => c.id === p.categoryId);
            return (
              <ProductCard
                key={p.id}
                product={p}
                categoryName={cat?.name}
                onEdit={handleEdit}
                onToggleStatus={handleToggleStatus}
                onArchive={handleArchive}
              />
            );
          })}
        </div>
      )}

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        product={editingProduct}
        categories={categories}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
