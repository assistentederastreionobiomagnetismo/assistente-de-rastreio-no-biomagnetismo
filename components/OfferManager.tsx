
import React, { useState } from 'react';
import { Product } from '../types';
import { PlusIcon, TrashIcon, PencilIcon, CheckIcon, InfoIcon } from './icons/Icons';
import { dbService } from '../services/dbService';

const EMOJIS = ['🚀', '✨', '💎', '🔥', '✅', '🎁', '📦', '💰', '🎯', '📢', '💡', '👉', '👇', '⭐', '❤️', '📍', '📱', '💻', '🛒', '⚡'];

const EmojiPicker: React.FC<{ onSelect: (emoji: string) => void }> = ({ onSelect }) => {
  return (
    <div className="absolute z-20 bg-white border border-slate-200 shadow-xl rounded-xl p-3 grid grid-cols-5 gap-2 animate-fade-in mt-1 right-0 top-full">
      {EMOJIS.map(emoji => (
        <button
          key={emoji}
          type="button"
          onClick={() => onSelect(emoji)}
          className="text-xl hover:bg-slate-100 p-1 rounded transition-colors"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};

interface OfferManagerProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  onExit: () => void;
}

const OfferManager: React.FC<OfferManagerProps> = ({ products, setProducts, onExit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<'title' | 'description' | 'copyText' | null>(null);
  const [isUploading, setIsUploading] = useState<'image' | 'video' | null>(null);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({
    title: '',
    description: '',
    copyText: '',
    imageUrl: '',
    videoUrl: '',
    affiliateLink: '',
    ctaText: 'Clique Aqui',
    isFeatured: false,
    displayOrder: 0
  });

  const addEmoji = (emoji: string, field: 'title' | 'description' | 'copyText') => {
    setCurrentProduct(prev => ({
      ...prev,
      [field]: (prev[field] || '') + emoji
    }));
    setShowEmojiPicker(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(type);
    try {
      const url = await dbService.uploadStoreMedia(file);
      setCurrentProduct(prev => ({
        ...prev,
        [type === 'image' ? 'imageUrl' : 'videoUrl']: url
      }));
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao subir arquivo. Verifique se o bucket "store-media" foi criado no Supabase.');
    } finally {
      setIsUploading(null);
    }
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await dbService.saveProduct(currentProduct as Product);
      const updatedProducts = await dbService.getProducts();
      setProducts(updatedProducts);
      setIsEditing(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      alert('Erro ao salvar produto. Verifique o console.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta oferta?')) return;
    try {
      await dbService.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
    }
  };

  const handleEdit = (product: Product) => {
    setCurrentProduct(product);
    setIsEditing(true);
  };

  const resetForm = () => {
    setCurrentProduct({
      title: '',
      description: '',
      copyText: '',
      imageUrl: '',
      videoUrl: '',
      affiliateLink: '',
      ctaText: 'Clique Aqui',
      isFeatured: false,
      displayOrder: 0
    });
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden p-6 md:p-10">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-slate-100 pb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Gerenciar Ofertas</h2>
            <p className="text-slate-500 text-sm italic">Administração da "Nossa Loja"</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { resetForm(); setIsEditing(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all font-bold text-sm shadow-lg shadow-teal-500/20"
            >
              <PlusIcon className="w-4 h-4" />
              Nova Oferta
            </button>
            <button
              onClick={onExit}
              className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all font-bold text-sm"
            >
              Sair
            </button>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-700 mb-4">{currentProduct.id ? 'Editar Oferta' : 'Nova Oferta'}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 relative">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Título do Produto</label>
                  <button 
                    type="button" 
                    onClick={() => setShowEmojiPicker(showEmojiPicker === 'title' ? null : 'title')}
                    className="text-lg hover:scale-110 transition-transform"
                  >
                    😀
                  </button>
                </div>
                <input
                  required
                  type="text"
                  value={currentProduct.title}
                  onChange={e => setCurrentProduct({ ...currentProduct, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                  placeholder="Ex: Curso de Biomagnetismo Avançado"
                />
                {showEmojiPicker === 'title' && <EmojiPicker onSelect={(e) => addEmoji(e, 'title')} />}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Texto do Botão (CTA)</label>
                <input
                  required
                  type="text"
                  value={currentProduct.ctaText}
                  onChange={e => setCurrentProduct({ ...currentProduct, ctaText: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                  placeholder="Ex: Clique Aqui para Comprar"
                />
              </div>
            </div>

            <div className="space-y-2 relative">
              <div className="flex justify-between items-center">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Descrição Curta</label>
                <button 
                  type="button" 
                  onClick={() => setShowEmojiPicker(showEmojiPicker === 'description' ? null : 'description')}
                  className="text-lg hover:scale-110 transition-transform"
                  title="Inserir Emoji"
                >
                  😀
                </button>
              </div>
              <input
                required
                type="text"
                value={currentProduct.description}
                onChange={e => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                placeholder="Uma frase curta que resume o benefício."
              />
              {showEmojiPicker === 'description' && <EmojiPicker onSelect={(e) => addEmoji(e, 'description')} />}
            </div>

            <div className="space-y-2 relative">
              <div className="flex justify-between items-center">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Texto de Venda (Copy)</label>
                <button 
                  type="button" 
                  onClick={() => setShowEmojiPicker(showEmojiPicker === 'copyText' ? null : 'copyText')}
                  className="text-lg hover:scale-110 transition-transform"
                  title="Inserir Emoji"
                >
                  😀
                </button>
              </div>
              <textarea
                required
                rows={3}
                value={currentProduct.copyText}
                onChange={e => setCurrentProduct({ ...currentProduct, copyText: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                placeholder="Escreva aqui o texto persuasivo que aparecerá no post."
              />
              {showEmojiPicker === 'copyText' && <EmojiPicker onSelect={(e) => addEmoji(e, 'copyText')} />}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Imagem (URL ou Upload)</label>
                <div className="flex gap-2">
                  <input
                    required
                    type="url"
                    value={currentProduct.imageUrl}
                    onChange={e => setCurrentProduct({ ...currentProduct, imageUrl: e.target.value })}
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-sm"
                    placeholder="https://..."
                  />
                  <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-xl flex items-center justify-center transition-all min-w-[100px]">
                    <span className="text-xs font-bold">{isUploading === 'image' ? '...' : 'Upload'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, 'image')} />
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Vídeo (URL ou Upload)</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={currentProduct.videoUrl}
                    onChange={e => setCurrentProduct({ ...currentProduct, videoUrl: e.target.value })}
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-sm"
                    placeholder="Link ou arquivo"
                  />
                  <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-xl flex items-center justify-center transition-all min-w-[100px]">
                    <span className="text-xs font-bold">{isUploading === 'video' ? '...' : 'Upload'}</span>
                    <input type="file" accept="video/*" className="hidden" onChange={e => handleFileUpload(e, 'video')} />
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Link de Afiliado (Destino)</label>
              <input
                required
                type="url"
                value={currentProduct.affiliateLink}
                onChange={e => setCurrentProduct({ ...currentProduct, affiliateLink: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                placeholder="https://sua-oferta.com/..."
              />
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div 
                  className={`w-6 h-6 rounded border-2 transition-all flex items-center justify-center ${currentProduct.isFeatured ? 'bg-teal-500 border-teal-500' : 'border-slate-300 bg-white group-hover:border-teal-400'}`}
                  onClick={() => setCurrentProduct({ ...currentProduct, isFeatured: !currentProduct.isFeatured })}
                >
                  {currentProduct.isFeatured && <CheckIcon className="w-4 h-4 text-white" />}
                </div>
                <span className="text-sm font-bold text-slate-700">Destaque no Carrossel?</span>
              </label>

              <div className="flex items-center gap-3">
                <label className="text-sm font-bold text-slate-700">Ordem:</label>
                <input
                  type="number"
                  value={currentProduct.displayOrder}
                  onChange={e => setCurrentProduct({ ...currentProduct, displayOrder: parseInt(e.target.value) || 0 })}
                  className="w-20 px-3 py-1 rounded-lg border border-slate-200 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t border-slate-200">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 py-4 bg-teal-500 text-white font-black rounded-2xl hover:bg-teal-600 transition-all shadow-xl shadow-teal-500/20 disabled:opacity-50"
              >
                {isSaving ? 'Salvando...' : (currentProduct.id ? 'Salvar Alterações' : 'Criar Oferta')}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-8 py-4 bg-white text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all border border-slate-200"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            {products.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <InfoIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Nenhum produto cadastrado ainda.</p>
                <button 
                   onClick={() => setIsEditing(true)}
                   className="mt-4 text-teal-600 font-bold hover:underline"
                >
                   Cadastre sua primeira oferta agora
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                      <th className="px-4 py-4">Produto</th>
                      <th className="px-4 py-4">Status</th>
                      <th className="px-4 py-4">Ordem</th>
                      <th className="px-4 py-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {products.map(product => (
                      <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <img src={product.imageUrl} className="w-10 h-10 rounded-lg object-cover" />
                            <div>
                              <p className="font-bold text-slate-800 text-sm">{product.title}</p>
                              <p className="text-slate-500 text-xs truncate max-w-[200px]">{product.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {product.isFeatured && (
                            <span className="bg-teal-100 text-teal-700 text-[10px] font-black px-2 py-0.5 rounded uppercase">Destaque</span>
                          )}
                        </td>
                        <td className="px-4 py-4 font-mono text-xs text-slate-500">
                          {product.displayOrder}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                               onClick={() => handleEdit(product)}
                               className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                               title="Editar"
                            >
                               <PencilIcon className="w-5 h-5" />
                            </button>
                            <button 
                               onClick={() => handleDelete(product.id!)}
                               className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                               title="Excluir"
                            >
                               <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OfferManager;
