'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, CheckCircle, Crown, Flame, ShieldCheck, Edit3, Loader2, Globe } from 'lucide-react';
import { ProductEntry, BoardType } from '../lib/types';
import { calculateRequiredBid, inferStartupName } from '../lib/data';
import DodoCheckout from './DodoCheckout';
import FaviconImage from './FaviconImage';
import { toast } from '@/lib/toast';

interface ClaimRankModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTargetRank?: number;
  initialProductUrl?: string;
  initialProductName?: string;
  board: BoardType;
  products: ProductEntry[];
  onPlaceBid: (payload: {
    productName: string;
    productUrl: string;
    tagline: string;
    logo: string;
    category: ProductEntry['category'];
    bidAmount: number;
    targetRank: number;
    isBump: boolean;
  }) => void;
}

export default function ClaimRankModal({
  isOpen,
  onClose,
  initialTargetRank = 1,
  initialProductUrl = '',
  initialProductName = '',
  board,
  products,
  onPlaceBid,
}: ClaimRankModalProps) {
  const [targetRank, setTargetRank] = useState<number>(initialTargetRank);
  const [url, setUrl] = useState<string>(initialProductUrl);
  const [name, setName] = useState<string>(
    initialProductName || (initialProductUrl ? inferStartupName(initialProductUrl) : '')
  );
  const [tagline, setTagline] = useState<string>('');
  const [logo, setLogo] = useState<string>('🚀');
  const [category, setCategory] = useState<ProductEntry['category']>('AI & ML');
  const [customBid, setCustomBid] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [showEditProduct, setShowEditProduct] = useState<boolean>(false);
  const [browserTitle, setBrowserTitle] = useState<string>('');
  const [fetchingMetadata, setFetchingMetadata] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setTargetRank(initialTargetRank || 1);
      setUrl(initialProductUrl || '');
      if (initialProductName) {
        setName(initialProductName);
      } else if (initialProductUrl) {
        setName(inferStartupName(initialProductUrl));
      }
      setSubmitted(false);
      setShowEditProduct(false);
      setBrowserTitle('');
    }
  }, [isOpen, initialTargetRank, initialProductUrl, initialProductName]);

  const cleanUrl = url.trim().toLowerCase().replace(/\/$/, '');
  const existingProduct = useMemo(() => {
    if (!cleanUrl) return null;
    return products.find(
      (p) => p.url.trim().toLowerCase().replace(/\/$/, '') === cleanUrl
    );
  }, [cleanUrl, products]);

  useEffect(() => {
    if (existingProduct) {
      setName(existingProduct.name);
      setTagline(existingProduct.tagline);
      setLogo(existingProduct.logo);
      setCategory(existingProduct.category);
    }
  }, [existingProduct]);

  // Automatically fetch the browser display line / title of the link
  useEffect(() => {
    if (!cleanUrl || !cleanUrl.includes('.') || cleanUrl.length < 4) {
      setBrowserTitle('');
      setFetchingMetadata(false);
      return;
    }

    const timer = setTimeout(async () => {
      setFetchingMetadata(true);
      try {
        const res = await fetch(`/api/metadata?url=${encodeURIComponent(cleanUrl)}`);
        const data = await res.json();
        if (data.success && data.title) {
          setBrowserTitle(data.title);
          // Autofill name if not explicitly customized
          setName((prev) => {
            const inferred = inferStartupName(cleanUrl);
            if (!prev || prev === inferred) {
              return data.siteName || data.title.split(/[-|•:]/)[0].trim() || inferred;
            }
            return prev;
          });
          // Autofill tagline if empty
          if (data.description) {
            setTagline((prev) => prev ? prev : data.description.slice(0, 120));
          }
        }
      } catch (err) {
        console.error('Failed to fetch link metadata', err);
      } finally {
        setFetchingMetadata(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [cleanUrl]);

  const bidCalculation = useMemo(() => {
    return calculateRequiredBid({
      targetRank,
      sortedProducts: products,
      board,
      existingProductUrl: url,
    });
  }, [targetRank, products, board, url]);

  const minNetPayable = bidCalculation.netPayable;
  const enteredAmount = customBid ? parseFloat(customBid) || minNetPayable : minNetPayable;
  const currentHolder = bidCalculation.currentHolder;

  // Is the current holder of targetRank this exact same user's product?
  const isSelfHolder = useMemo(() => {
    if (!existingProduct || !currentHolder) return false;
    return (
      existingProduct.id === currentHolder.id ||
      existingProduct.url.trim().toLowerCase().replace(/\/$/, '') ===
      currentHolder.url.trim().toLowerCase().replace(/\/$/, '')
    );
  }, [existingProduct, currentHolder]);

  if (!isOpen) return null;

  const executeBid = (orderId?: string) => {
    if (!url || !name) {
      toast.warning('Missing Info', 'Please enter your product URL and name.');
      return;
    }

    if (enteredAmount < minNetPayable) {
      toast.warning(
        'Minimum Bid Required',
        `Minimum to claim #${targetRank} is $${minNetPayable.toLocaleString()}`
      );
      return;
    }

    const finalUrl = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`;
    const finalName = name.trim() || inferStartupName(finalUrl) || 'My Startup';

    try {
      const stored = JSON.parse(localStorage.getItem('azyra_user_startups') || '[]');
      const cleanTarget = finalUrl.toLowerCase().replace(/\/$/, '');
      if (!stored.includes(cleanTarget)) {
        localStorage.setItem('azyra_user_startups', JSON.stringify([...stored, cleanTarget]));
      }
    } catch (e) {
      console.error(e);
    }

    onPlaceBid({
      productName: finalName,
      productUrl: finalUrl,
      tagline: tagline.trim() || 'Next-generation tech & software',
      logo: logo || '🚀',
      category,
      bidAmount: enteredAmount,
      targetRank,
      isBump: !!existingProduct,
    });

    toast.success('Rank Secured!', `#${targetRank} claimed for ${finalName}.`);
    setSubmitted(true);
    setTimeout(() => {
      onClose();
      if (typeof window !== 'undefined') {
        const el = document.getElementById(`rank-${targetRank}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 1800);
  };

  const handleQuickAdd = (delta: number) => {
    const current = customBid ? parseFloat(customBid) || minNetPayable : minNetPayable;
    setCustomBid((current + delta).toString());
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-lg border border-borderStrong bg-surface p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 text-textMain max-h-[92dvh] overflow-y-auto my-auto"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-textMuted hover:text-textMain hover:bg-surfaceElevated transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-3.5 animate-in fade-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-limeAccent/15 text-limeAccent ring-2 ring-limeAccent/30 shadow-lg shadow-limeAccent/10 animate-bounce">
              <Crown className="h-8 w-8 fill-limeAccent/20 text-limeAccent" />
            </div>
            <div className="space-y-1">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold text-limeAccent bg-limeAccent/10 border border-limeAccent/30">
                Rank #{targetRank} Secured
              </span>
              <h3 className="text-xl font-heading font-bold text-textMain">
                Leaderboard Position Claimed!
              </h3>
              <p className="text-xs text-textMuted">
                <strong className="text-textMain">{name}</strong> is now live at Rank #{targetRank}.
              </p>
            </div>
            <div className="rounded-xl bg-surfaceElevated border border-borderMuted p-3 text-left space-y-1.5 text-xs font-mono">
              <div className="flex justify-between items-center text-textMuted">
                <span>Secured Rank:</span>
                <span className="text-limeAccent font-bold">#{targetRank}</span>
              </div>
              <div className="flex justify-between items-center text-textMuted">
                <span>Total Capital:</span>
                <span className="text-textMain font-bold">${(bidCalculation.existingSpend + enteredAmount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-textMuted">
                <span>Outbid Status:</span>
                <span className="text-emeraldAccent text-[11px]">Displaced prior rank #{targetRank}</span>
              </div>
            </div>
            <p className="text-[11px] font-mono text-textMuted">
              Returning you to Rank #{targetRank} on the leaderboard...
            </p>
          </div>
        ) : (
          <>
            {/* Header: Clean & Minimal */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-heading font-bold text-textMain flex items-center gap-1.5">
                  {targetRank === 1 ? (
                    <Crown className="h-5 w-5 text-limeAccent fill-limeAccent" />
                  ) : (
                    <Flame className="h-4 w-4 text-limeAccent" />
                  )}
                  {isSelfHolder ? `Defend Rank #${targetRank}` : `Claim Rank #${targetRank}`}
                </h2>
                <span className="rounded-md bg-surfaceElevated px-2 py-0.5 text-[10px] font-mono text-limeAccent border border-borderMuted">
                  {board === 'all-time' ? 'All-Time' : 'Today'}
                </span>
              </div>
              <p className="text-xs text-textMuted">
                {isSelfHolder ? (
                  <span>
                    You hold this spot with <strong className="text-textMain">${bidCalculation.existingSpend.toLocaleString()}</strong>. Boost your lead.
                  </span>
                ) : currentHolder ? (
                  <span>
                    Occupant: <strong className="text-textMain">{currentHolder.name}</strong> (${(board === 'all-time' ? currentHolder.allTimeSpend : currentHolder.todaySpend).toLocaleString()}) • <span className="text-emeraldAccent font-mono font-medium">+$1 outbid to win</span>
                  </span>
                ) : (
                  <span className="text-emeraldAccent">Open spot • Start from $1</span>
                )}
              </p>
            </div>

            {/* Target Rank Selector Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[1, 2, 3, 5, 10].map((rk) => (
                <button
                  key={rk}
                  type="button"
                  onClick={() => {
                    setTargetRank(rk);
                    setCustomBid('');
                  }}
                  className={`py-1.5 px-2.5 sm:px-3 rounded-lg text-xs font-mono font-bold transition border cursor-pointer ${targetRank === rk
                      ? 'bg-limeAccent text-[#0B0F10] border-limeAccent shadow-sm'
                      : 'bg-surfaceElevated text-textMuted border-borderMuted hover:text-textMain hover:border-borderStrong'
                    }`}
                >
                  #{rk}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setTargetRank(products.length + 1);
                  setCustomBid('1');
                }}
                className={`py-1.5 px-2.5 rounded-lg text-xs font-mono font-semibold transition border cursor-pointer ${targetRank === products.length + 1
                    ? 'bg-emeraldAccent text-[#0B0F10] border-emeraldAccent font-bold'
                    : 'bg-surfaceElevated text-emeraldAccent border-emeraldAccent/20 hover:border-emeraldAccent/40'
                  }`}
              >
                Bottom (#{products.length + 1}) · $1
              </button>
              <div className="flex items-center bg-surfaceElevated px-2 py-1.5 rounded-lg border border-borderMuted">
                <span className="text-xs text-textMuted font-mono mr-1">#</span>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={targetRank}
                  onChange={(e) => {
                    setTargetRank(Math.max(1, parseInt(e.target.value) || 1));
                    setCustomBid('');
                  }}
                  className="w-8 sm:w-10 bg-transparent text-xs text-textMain font-mono font-bold text-center focus:outline-none"
                />
              </div>
            </div>

            {/* Product Identification */}
            {existingProduct && !showEditProduct ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-surfaceElevated border border-borderMuted">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FaviconImage url={existingProduct.url} fallback="🌐" className="w-5 h-5 rounded" size={32} />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-textMain block truncate">{existingProduct.name}</span>
                    <span className="text-[11px] font-mono text-textMuted truncate block">{existingProduct.url.replace(/^https?:\/\//, '')}</span>
                    {browserTitle && (
                      <span className="text-[10px] text-limeAccent font-mono truncate block mt-0.5">
                        Title: {browserTitle}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-mono font-medium text-emeraldAccent bg-emeraldAccent/10 border border-emeraldAccent/30 px-2 py-0.5 rounded-md">
                    ${bidCalculation.existingSpend.toLocaleString()} credited
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowEditProduct(true)}
                    title="Change listing"
                    className="p-1 rounded text-textMuted hover:text-textMain hover:bg-surfaceElevated transition cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5">
                    <FaviconImage url={url} fallback="🌐" className="w-4 h-4 rounded" size={32} />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="yourstartup.com"
                    value={url}
                    onChange={(e) => {
                      const newUrl = e.target.value;
                      setUrl(newUrl);
                      if (!name && newUrl.includes('.')) {
                        setName(inferStartupName(newUrl));
                      }
                    }}
                    className="w-full bg-surfaceElevated border border-borderMuted rounded-md pl-10 pr-3 py-2 text-xs text-textMain placeholder:text-textMuted/60 focus:border-borderStrong outline-none font-mono"
                  />
                </div>

                {/* Browser display title indicator */}
                {fetchingMetadata && (
                  <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-mono text-limeAccent">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Fetching browser page title...</span>
                  </div>
                )}
                {!fetchingMetadata && browserTitle && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surfaceElevated border border-borderMuted text-[11px] font-mono text-textMuted truncate">
                    <Globe className="h-3 w-3 text-limeAccent shrink-0" />
                    <span className="text-textMuted shrink-0">Title:</span>
                    <span className="text-textMain truncate font-medium">{browserTitle}</span>
                  </div>
                )}

                {!existingProduct && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Product Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="sm:col-span-2 bg-surfaceElevated border border-borderMuted rounded-md px-3 py-2 text-xs text-textMain placeholder:text-textMuted/60 focus:border-borderStrong outline-none"
                    />
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="sm:col-span-1 bg-surfaceElevated border border-borderMuted rounded-md px-2 py-2 text-xs text-textMain focus:border-borderStrong outline-none cursor-pointer"
                    >
                      <option value="AI & ML" className="bg-surface text-textMain">AI & ML</option>
                      <option value="DevTools" className="bg-surface text-textMain">DevTools</option>
                      <option value="SaaS" className="bg-surface text-textMain">SaaS</option>
                      <option value="Web3" className="bg-surface text-textMain">Web3</option>
                      <option value="Fintech" className="bg-surface text-textMain">Fintech</option>
                      <option value="Design" className="bg-surface text-textMain">Design</option>
                      <option value="Productivity" className="bg-surface text-textMain">Productivity</option>
                      <option value="Marketing" className="bg-surface text-textMain">Marketing</option>
                      <option value="E-commerce" className="bg-surface text-textMain">E-commerce</option>
                      <option value="Others" className="bg-surface text-textMain">Others</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Clean Receipt / Settlement Breakdown */}
            <div className="rounded-xl bg-surfaceElevated border border-borderMuted p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-textMuted">
                <span>Rank #{targetRank} Benchmark {currentHolder ? `(${currentHolder.name} + $1)` : ''}</span>
                <span className="font-mono text-textMain font-medium">
                  ${bidCalculation.targetSpendRequired.toLocaleString()}
                </span>
              </div>

              {bidCalculation.existingSpend > 0 && (
                <div className="flex items-center justify-between text-xs text-emeraldAccent">
                  <span>Your Previous Spend (Credit Applied)</span>
                  <span className="font-mono font-medium">
                    −${bidCalculation.existingSpend.toLocaleString()}
                  </span>
                </div>
              )}

              <div className="border-t border-borderMuted pt-2.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-heading font-bold text-textMain block">
                    Total Due to Claim
                  </span>
                  <span className="text-[11px] font-mono text-textMuted">
                    Min. required: ${minNetPayable.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center bg-surface px-3 py-1.5 rounded-md border border-borderStrong focus-within:border-limeAccent">
                  <span className="text-sm text-limeAccent font-mono font-bold mr-1">$</span>
                  <input
                    type="number"
                    min={minNetPayable}
                    value={customBid === '' ? minNetPayable : customBid}
                    onChange={(e) => setCustomBid(e.target.value)}
                    className="w-20 bg-transparent text-right font-mono font-bold text-textMain text-base focus:outline-none"
                  />
                </div>
              </div>

              {/* Quick Boost Pills */}
              <div className="flex items-center justify-between pt-1 border-t border-borderMuted text-[10px]">
                <span className="text-textMuted font-mono">Extend lead:</span>
                <div className="flex items-center gap-1 font-mono">
                  {[1, 5, 25, 100].map((boost) => (
                    <button
                      key={boost}
                      type="button"
                      onClick={() => handleQuickAdd(boost)}
                      className="px-2 py-0.5 rounded bg-surface hover:bg-surfaceElevated hover:text-textMain text-textMuted border border-borderMuted transition cursor-pointer"
                    >
                      +${boost}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Seamless Dodo Checkout */}
            <div className="pt-1">
              <DodoCheckout
                compact={true}
                amountUsd={enteredAmount}
                type="rank_outbid"
                campaignTitle={`Claim Rank #${targetRank}: ${name || 'Product'}`}
                redirectUrl={
                  typeof window !== 'undefined'
                    ? `${window.location.pathname}${window.location.search || ''}#rank-${targetRank}`
                    : '/'
                }
                metadata={{
                  target_rank: targetRank,
                  product_name: name || inferStartupName(url) || 'My Startup',
                  product_url: url,
                  category,
                }}
                buttonLabel={`Pay $${enteredAmount.toLocaleString(undefined, {
                  minimumFractionDigits: enteredAmount % 1 === 0 ? 0 : 2,
                  maximumFractionDigits: 2,
                })} to ${isSelfHolder ? 'Defend' : 'Claim'} Rank #${targetRank}`}
                onSuccess={(orderId) => executeBid(orderId)}
                onError={(err) => toast.error('Payment Error', err)}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}