'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { removeFromCart, updateQuantity, clearCart } from '@/store/cartSlice';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Define schema for the quotation form
const quotationSchema = z.object({
    name: z.string().min(1, { message: 'Name is required' }),
    email: z.string().email({ message: 'Invalid email format' }),
    phone: z.string().min(1, { message: 'Phone number is required' }),
    countryCode: z.string().min(1, { message: 'Country code is required' }),
    message: z.string().optional(),
    preferredContact: z.enum(['email', 'whatsapp', 'call']),
});

type QuotationFormData = z.infer<typeof quotationSchema>;

export default function CartPage() {
    const { isAuthenticated } = useAuth();
    const dispatch = useDispatch();
    const cart = useSelector((state: RootState) => state.cart);

    const [isLoading, setIsLoading] = useState(false);
    const [showQuotationModal, setShowQuotationModal] = useState(false);
    
    // Initialize React Hook Form
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
    } = useForm<QuotationFormData>({
        resolver: zodResolver(quotationSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            countryCode: '+91',
            message: '',
            preferredContact: 'email',
        },
    });
    
    // State for quotation form
    const [quotationForm, setQuotationForm] = useState({
        name: '',
        email: '',
        phone: '',
        countryCode: '+91',
        message: '',
        preferredContact: 'email' as 'email' | 'whatsapp' | 'call'
    });

    const handleUpdateQuantity = (id: string, currentQty: number, delta: number) => {
        const newQty = currentQty + delta;
        if (newQty > 0) {
            dispatch(updateQuantity({ id, quantity: newQty }));
        } else if (newQty === 0) {
            dispatch(removeFromCart(id));
            toast.info('Item removed from cart');
        }
    };

    const handleRemove = (id: string) => {
        dispatch(removeFromCart(id));
        toast.info('Item removed from cart');
    };

    const handleClear = () => {
        if (window.confirm('Are you sure you want to clear your cart?')) {
            dispatch(clearCart());
            toast.info('Cart cleared');
        }
    };

    const handleSendInquiry = async () => {
        if (cart.items.length === 0) {
            toast.error('Cart is empty');
            return;
        }

        // If authenticated, proceed with normal flow
        if (isAuthenticated) {
            try {
                setIsLoading(true);
                const response = await fetch('/api/inquiries', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        items: cart.items,
                        notes: 'Order inquiry from website'
                    }),
                });

                const data = await response.json();

                if (data.success) {
                    toast.success('Inquiry sent successfully! Our team will contact you soon.');
                    dispatch(clearCart());
                } else {
                    toast.error(data.message || 'Failed to send inquiry');
                }
            } catch (error) {
                console.error('Error sending inquiry:', error);
                toast.error('Something went wrong. Please try again.');
            } finally {
                setIsLoading(false);
            }
        } else {
            // If not authenticated, show the quotation modal
            setShowQuotationModal(true);
        }
    };

    // Handler for submitting the quotation form with React Hook Form
    const onSubmitQuotation: SubmitHandler<QuotationFormData> = async (formData) => {
        try {
            setIsLoading(true);
            
            // Prepare the inquiry data with user information
            const inquiryData = {
                items: cart.items,
                notes: 'Order inquiry from website',
                customerInfo: {
                    name: formData.name,
                    email: formData.email,
                    phone: `${formData.countryCode}${formData.phone}`,
                    preferredContact: formData.preferredContact,
                    message: formData.message
                }
            };

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/inquiries/customer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(inquiryData),
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Inquiry sent successfully! Our team will contact you soon.');
                dispatch(clearCart());
                setShowQuotationModal(false);
                // Reset form
                reset();
            } else {
                toast.error(data.message || 'Failed to send inquiry');
            }
        } catch (error) {
            console.error('Error sending inquiry:', error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-white">
            <Header />

            {/* Hero Section */}
            <div className="relative h-[30vh] w-full bg-black flex items-center justify-center pt-20">
                <div className="text-center">
                    <h1 className="text-3xl md:text-4xl font-sans font-bold tracking-wide mb-2 text-white tan-agean uppercase">
                        Your Shopping Cart
                    </h1>
                    <div className="w-16 h-0.5 bg-amber-600 mx-auto"></div>
                </div>
            </div>

            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-12 py-16">
                {cart.items.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="mb-6 flex justify-center">
                            <div className="p-6">
                                <ShoppingCart className="h-12 w-12 text-gray-300" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-normal text-gray-900 mb-4 uppercase">Your cart is empty</h2>
                        <p className="text-black mb-8 max-w-md mx-auto">Looks like you haven't added any gorgeous pieces to your cart yet.</p>
                        <Link
                            href="/jewelry"
                            className="inline-block px-10 py-4 border-2 border-black text-black font-medium uppercase hover:bg-black hover:text-white transition-all duration-300"
                        >
                            Discover Collections
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Cart Items List */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                                <h2 className="text-md font-bold  text-gray-900 tan-agean">
                                    Items ({cart.totalItems})
                                </h2>
                                <button
                                    onClick={handleClear}
                                    className="text-xl font-bold tan-agean text-black hover:text-red-500   transition-colors"
                                >
                                    Clear Cart
                                </button>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {cart.items.map((item) => (
                                    <div key={item.id} className="py-6 flex flex-col sm:flex-row gap-6 group bg-white shadow-lg px-6">
                                        {/* Item Image */}
                                        <Link href={`/jewelry/${item.category.toLowerCase()}/${item.id}`} className="relative h-32 w-32 bg-gray-50 flex-shrink-0 overflow-hidden rounded-md">
                                            <Image
                                                src={
                                                    item.images[0]?.url
                                                        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${item.images[0].url}`
                                                        : item.imageUrl
                                                            ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${item.imageUrl}`
                                                            : ''
                                                }
                                                alt={item.name}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        </Link>

                                        {/* Item Info */}
                                        <div className="flex-grow flex flex-col justify-between">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <Link href={`/jewelry/${item.category.toLowerCase()}/${item.id}`}>
                                                        <h3 className="text-xl font-normal text-gray-900 uppercase  hover:text-amber-600 transition-colors">
                                                            {item.productCode}
                                                        </h3>
                                                    </Link>
                                                    <p className="text-lg text-black mt-1 uppercase tracking-wider">{item.category}</p>
                                                   
                                                </div>
                                                <button
                                                    onClick={() => handleRemove(item.id)}
                                                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </button>
                                            </div>

                                            <div className="flex justify-between items-end mt-4">
                                                {/* Quantity Controls */}
                                                <div className="flex items-center border border-gray-200 rounded-full p-1 bg-gray-50">
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                                                        className="p-1 hover:text-amber-600 transition-colors"
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </button>
                                                    <span className="w-8 text-center text-sm font-bold text-gray-900">{item.quantity}</span>
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                                                        className="p-1 hover:text-amber-600 transition-colors"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </button>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Link
                                href="/jewelry"
                                className="inline-flex items-center gap-2 text-sm font-bold text-gray-900 hover:text-amber-600 transition-colors mt-8 uppercase tracking-widest"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Continue Shopping
                            </Link>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-gray-50 p-8 rounded-lg space-y-6 sticky top-32">
                                <h2 className="text-lg font-bold tan-agean uppercase tracking-widest text-gray-900 border-b border-gray-200 pb-4">
                                    Order Summary
                                </h2>

                                <div className="space-y-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-black text-lg font-normal uppercase ">Total Items</span>
                                        <span className="text-black text-lg font-normal">{cart.totalItems}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-black text-lg font-normal uppercase ">Inquiry Status</span>
                                        <span className="text-black text-lg font-normal">In Progress</span>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-200">
                                    <p className="text-sm text-gray-800 font-normal leading-relaxed mb-6 italic text-center ">
                                        Note: This inquiry will be sent to our team who will contact you with current pricing based on live gold and diamond rates.
                                    </p>

                                    {!isAuthenticated ? (
                                        <div className="space-y-4">
                                            <p className="text-center text-sm text-gray-600">
                                                Please provide your details to send inquiry
                                            </p>
                                            <button
                                                onClick={() => setShowQuotationModal(true)}
                                                className="w-full tan-agean rounded-lg block text-center px-4 py-3 bg-black text-white rounded font-bold uppercase tracking-widest hover:bg-amber-600 transition-all duration-300"
                                            >
                                                Get Price Quote
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleSendInquiry}
                                            disabled={isLoading}
                                            className="w-full bg-black text-white py-4 rounded-full font-bold uppercase tracking-widest hover:bg-amber-600 transition-all duration-300 shadow-lg shadow-black/10 hover:shadow-amber-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isLoading ? 'Sending...' : 'Send Inquiry'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Quotation Modal for Unauthorized Users */}
            {showQuotationModal && (
                <div className="fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/50"></div>
                    <motion.div 
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-xl"
                    >
                        <div className="p-6 h-full overflow-y-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-gray-900 tan-agean">Get Price Quotation</h3>
                                <button
                                    onClick={() => setShowQuotationModal(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                            
                            <form onSubmit={handleSubmit(onSubmitQuotation)}>
                                <div className="space-y-6">
                                  {/* Cart Items Information */}
                                  <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-semibold text-black mb-3">Selected Items ({cart.items.length})</h4>
                                    <div className="max-h-60 overflow-y-auto">
                                      {cart.items.map((item, index) => (
                                        <div key={`${item.id}-${index}`} className="flex gap-2 mb-2 last:mb-0">
                                          <div className="flex-shrink-0">
                                            <div className="relative w-10 h-10 rounded-md overflow-hidden bg-gray-200">
                                              <Image
                                                src={
                                                  item.images[0]?.url
                                                    ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${item.images[0].url}`
                                                    : item.imageUrl
                                                      ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${item.imageUrl}`
                                                      : 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=2070&auto=format&fit=crop'
                                                }
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                              />
                                            </div>
                                          </div>
                                          <div className="flex-1 space-y-0 text-xs">
                                            <p><span className="font-medium">Code:</span> {item.productCode}</p>
                                            <p><span className="font-medium">Qty:</span> {item.quantity}</p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                        <input
                                            type="text"
                                            {...register('name')}
                                            className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500`}
                                            placeholder="Enter your full name"
                                        />
                                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                                        <input
                                            type="email"
                                            {...register('email')}
                                            className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500`}
                                            placeholder="Enter your email"
                                        />
                                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                                    </div>
                                    
                                    {/* Phone with Country Code */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                                        <div className="flex gap-2">
                                            <select
                                                {...register('countryCode')}
                                                className={`w-28 px-3 py-2 border ${errors.countryCode ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500`}
                                            >
                                                <option value="+93">🇦🇫 Afghanistan (+93)</option>
                                                <option value="+355">🇦🇱 Albania (+355)</option>
                                                <option value="+213">🇩🇿 Algeria (+213)</option>
                                                <option value="+1">🇺🇸 American Samoa (+1)</option>
                                                <option value="+376">🇦🇩 Andorra (+376)</option>
                                                <option value="+244">🇦🇴 Angola (+244)</option>
                                                <option value="+1">🇦🇮 Anguilla (+1)</option>
                                                <option value="+672">🇦🇶 Antarctica (+672)</option>
                                                <option value="+1">🇦🇬 Antigua and Barbuda (+1)</option>
                                                <option value="+54">🇦🇷 Argentina (+54)</option>
                                                <option value="+374">🇦🇲 Armenia (+374)</option>
                                                <option value="+297">🇦🇼 Aruba (+297)</option>
                                                <option value="+61">🇦🇺 Australia (+61)</option>
                                                <option value="+43">🇦🇹 Austria (+43)</option>
                                                <option value="+994">🇦🇿 Azerbaijan (+994)</option>
                                                <option value="+1">🇧🇸 Bahamas (+1)</option>
                                                <option value="+973">🇧🇭 Bahrain (+973)</option>
                                                <option value="+880">🇧🇩 Bangladesh (+880)</option>
                                                <option value="+1">🇧🇧 Barbados (+1)</option>
                                                <option value="+375">🇧🇾 Belarus (+375)</option>
                                                <option value="+32">🇧🇪 Belgium (+32)</option>
                                                <option value="+501">🇧🇿 Belize (+501)</option>
                                                <option value="+229">🇧🇯 Benin (+229)</option>
                                                <option value="+1">🇧🇲 Bermuda (+1)</option>
                                                <option value="+975">🇧🇹 Bhutan (+975)</option>
                                                <option value="+591">🇧🇴 Bolivia (+591)</option>
                                                <option value="+387">🇧🇦 Bosnia and Herzegovina (+387)</option>
                                                <option value="+267">🇧🇼 Botswana (+267)</option>
                                                <option value="+55">🇧🇷 Brazil (+55)</option>
                                                <option value="+246">🇮🇴 British Indian Ocean Territory (+246)</option>
                                                <option value="+1">🇻🇬 British Virgin Islands (+1)</option>
                                                <option value="+673">🇧🇳 Brunei (+673)</option>
                                                <option value="+359">🇧🇬 Bulgaria (+359)</option>
                                                <option value="+226">🇧🇫 Burkina Faso (+226)</option>
                                                <option value="+257">🇧🇮 Burundi (+257)</option>
                                                <option value="+855">🇰🇭 Cambodia (+855)</option>
                                                <option value="+237">🇨🇲 Cameroon (+237)</option>
                                                <option value="+1">🇨🇦 Canada (+1)</option>
                                                <option value="+238">🇨🇻 Cape Verde (+238)</option>
                                                <option value="+1">🇰🇾 Cayman Islands (+1)</option>
                                                <option value="+236">🇨🇫 Central African Republic (+236)</option>
                                                <option value="+235">🇹🇩 Chad (+235)</option>
                                                <option value="+56">🇨🇱 Chile (+56)</option>
                                                <option value="+86">🇨🇳 China (+86)</option>
                                                <option value="+61">🇨🇽 Christmas Island (+61)</option>
                                                <option value="+61">🇨🇨 Cocos Islands (+61)</option>
                                                <option value="+57">🇨🇴 Colombia (+57)</option>
                                                <option value="+269">🇰🇲 Comoros (+269)</option>
                                                <option value="+682">🇨🇰 Cook Islands (+682)</option>
                                                <option value="+506">🇨🇷 Costa Rica (+506)</option>
                                                <option value="+385">🇭🇷 Croatia (+385)</option>
                                                <option value="+53">🇨🇺 Cuba (+53)</option>
                                                <option value="+599">🇨🇼 Curacao (+599)</option>
                                                <option value="+357">🇨🇾 Cyprus (+357)</option>
                                                <option value="+420">🇨🇿 Czech Republic (+420)</option>
                                                <option value="+243">🇨🇩 Democratic Republic of the Congo (+243)</option>
                                                <option value="+45">🇩🇰 Denmark (+45)</option>
                                                <option value="+253">🇩🇯 Djibouti (+253)</option>
                                                <option value="+1">🇩🇲 Dominica (+1)</option>
                                                <option value="+1">🇩🇴 Dominican Republic (+1)</option>
                                                <option value="+670">🇹🇱 East Timor (+670)</option>
                                                <option value="+593">🇪🇨 Ecuador (+593)</option>
                                                <option value="+20">🇪🇬 Egypt (+20)</option>
                                                <option value="+503">🇸🇻 El Salvador (+503)</option>
                                                <option value="+240">🇬🇶 Equatorial Guinea (+240)</option>
                                                <option value="+291">🇪🇷 Eritrea (+291)</option>
                                                <option value="+372">🇪🇪 Estonia (+372)</option>
                                                <option value="+251">🇪🇹 Ethiopia (+251)</option>
                                                <option value="+500">🇫🇰 Falkland Islands (+500)</option>
                                                <option value="+298">🇫🇴 Faroe Islands (+298)</option>
                                                <option value="+679">🇫🇯 Fiji (+679)</option>
                                                <option value="+358">🇫🇮 Finland (+358)</option>
                                                <option value="+33">🇫🇷 France (+33)</option>
                                                <option value="+689">🇵🇫 French Polynesia (+689)</option>
                                                <option value="+241">🇬🇦 Gabon (+241)</option>
                                                <option value="+220">🇬🇲 Gambia (+220)</option>
                                                <option value="+995">🇬🇪 Georgia (+995)</option>
                                                <option value="+49">🇩🇪 Germany (+49)</option>
                                                <option value="+233">🇬🇭 Ghana (+233)</option>
                                                <option value="+350">🇬🇮 Gibraltar (+350)</option>
                                                <option value="+30">🇬🇷 Greece (+30)</option>
                                                <option value="+299">🇬🇱 Greenland (+299)</option>
                                                <option value="+1">🇬🇩 Grenada (+1)</option>
                                                <option value="+1">🇬🇺 Guam (+1)</option>
                                                <option value="+502">🇬🇹 Guatemala (+502)</option>
                                                <option value="+44">🇬🇬 Guernsey (+44)</option>
                                                <option value="+224">🇬🇳 Guinea (+224)</option>
                                                <option value="+245">🇬🇼 Guinea-Bissau (+245)</option>
                                                <option value="+592">🇬🇾 Guyana (+592)</option>
                                                <option value="+509">🇭🇹 Haiti (+509)</option>
                                                <option value="+504">🇭🇳 Honduras (+504)</option>
                                                <option value="+852">🇭🇰 Hong Kong (+852)</option>
                                                <option value="+36">🇭🇺 Hungary (+36)</option>
                                                <option value="+354">🇮🇸 Iceland (+354)</option>
                                                <option value="+91">🇮🇳 India (+91)</option>
                                                <option value="+62">🇮🇩 Indonesia (+62)</option>
                                                <option value="+98">🇮🇷 Iran (+98)</option>
                                                <option value="+964">🇮🇶 Iraq (+964)</option>
                                                <option value="+353">🇮🇪 Ireland (+353)</option>
                                                <option value="+44">🇮🇲 Isle of Man (+44)</option>
                                                <option value="+972">🇮🇱 Israel (+972)</option>
                                                <option value="+39">🇮🇹 Italy (+39)</option>
                                                <option value="+225">🇨🇮 Ivory Coast (+225)</option>
                                                <option value="+1">🇯🇲 Jamaica (+1)</option>
                                                <option value="+81">🇯🇵 Japan (+81)</option>
                                                <option value="+44">🇯🇪 Jersey (+44)</option>
                                                <option value="+962">🇯🇴 Jordan (+962)</option>
                                                <option value="+7">🇰🇿 Kazakhstan (+7)</option>
                                                <option value="+254">🇰🇪 Kenya (+254)</option>
                                                <option value="+686">🇰🇮 Kiribati (+686)</option>
                                                <option value="+383">🇽🇰 Kosovo (+383)</option>
                                                <option value="+965">🇰🇼 Kuwait (+965)</option>
                                                <option value="+996">🇰🇬 Kyrgyzstan (+996)</option>
                                                <option value="+856">🇱🇦 Laos (+856)</option>
                                                <option value="+371">🇱🇻 Latvia (+371)</option>
                                                <option value="+961">🇱🇧 Lebanon (+961)</option>
                                                <option value="+266">🇱🇸 Lesotho (+266)</option>
                                                <option value="+231">🇱🇷 Liberia (+231)</option>
                                                <option value="+218">🇱🇾 Libya (+218)</option>
                                                <option value="+423">🇱🇮 Liechtenstein (+423)</option>
                                                <option value="+370">🇱🇹 Lithuania (+370)</option>
                                                <option value="+352">🇱🇺 Luxembourg (+352)</option>
                                                <option value="+853">🇲🇴 Macao (+853)</option>
                                                <option value="+389">🇲🇰 Macedonia (+389)</option>
                                                <option value="+261">🇲🇬 Madagascar (+261)</option>
                                                <option value="+265">🇲🇼 Malawi (+265)</option>
                                                <option value="+60">🇲🇾 Malaysia (+60)</option>
                                                <option value="+960">🇲🇻 Maldives (+960)</option>
                                                <option value="+223">🇲🇱 Mali (+223)</option>
                                                <option value="+356">🇲🇹 Malta (+356)</option>
                                                <option value="+692">🇲🇭 Marshall Islands (+691)</option>
                                                <option value="+222">🇲🇷 Mauritania (+222)</option>
                                                <option value="+230">🇲🇺 Mauritius (+230)</option>
                                                <option value="+262">🇾🇹 Mayotte (+262)</option>
                                                <option value="+52">🇲🇽 Mexico (+52)</option>
                                                <option value="+691">🇫🇲 Micronesia (+691)</option>
                                                <option value="+373">🇲🇩 Moldova (+373)</option>
                                                <option value="+377">🇲🇨 Monaco (+377)</option>
                                                <option value="+976">🇲🇳 Mongolia (+976)</option>
                                                <option value="+382">🇲🇪 Montenegro (+382)</option>
                                                <option value="+1">🇲🇸 Montserrat (+1)</option>
                                                <option value="+212">🇲🇦 Morocco (+212)</option>
                                                <option value="+258">🇲🇿 Mozambique (+258)</option>
                                                <option value="+95">🇲🇲 Myanmar (+95)</option>
                                                <option value="+264">🇳🇦 Namibia (+264)</option>
                                                <option value="+674">🇳🇷 Nauru (+674)</option>
                                                <option value="+977">🇳🇵 Nepal (+977)</option>
                                                <option value="+31">🇳🇱 Netherlands (+31)</option>
                                                <option value="+599">🇦🇳 Netherlands Antilles (+599)</option>
                                                <option value="+687">🇳🇨 New Caledonia (+687)</option>
                                                <option value="+64">🇳🇿 New Zealand (+64)</option>
                                                <option value="+505">🇳🇮 Nicaragua (+505)</option>
                                                <option value="+227">🇳🇪 Niger (+227)</option>
                                                <option value="+234">🇳🇬 Nigeria (+234)</option>
                                                <option value="+683">🇳🇺 Niue (+683)</option>
                                                <option value="+850">🇰🇵 North Korea (+850)</option>
                                                <option value="+1">🇲🇵 Northern Mariana Islands (+1)</option>
                                                <option value="+47">🇳🇴 Norway (+47)</option>
                                                <option value="+968">🇴🇲 Oman (+968)</option>
                                                <option value="+92">🇵🇰 Pakistan (+92)</option>
                                                <option value="+680">🇵🇼 Palau (+680)</option>
                                                <option value="+970">🇵🇸 Palestine (+970)</option>
                                                <option value="+507">🇵🇦 Panama (+507)</option>
                                                <option value="+675">🇵🇬 Papua New Guinea (+675)</option>
                                                <option value="+595">🇵🇾 Paraguay (+595)</option>
                                                <option value="+51">🇵🇪 Peru (+51)</option>
                                                <option value="+63">🇵🇭 Philippines (+63)</option>
                                                <option value="+64">🇵🇳 Pitcairn (+64)</option>
                                                <option value="+48">🇵🇱 Poland (+48)</option>
                                                <option value="+351">🇵🇹 Portugal (+351)</option>
                                                <option value="+1">🇵🇷 Puerto Rico (+1)</option>
                                                <option value="+974">🇶🇦 Qatar (+974)</option>
                                                <option value="+242">🇨🇬 Republic of the Congo (+242)</option>
                                                <option value="+262">🇷🇪 Reunion (+262)</option>
                                                <option value="+40">🇷🇴 Romania (+40)</option>
                                                <option value="+7">🇷🇺 Russia (+7)</option>
                                                <option value="+250">🇷🇼 Rwanda (+250)</option>
                                                <option value="+590">🇧🇱 Saint Barthelemy (+590)</option>
                                                <option value="+290">🇸🇭 Saint Helena (+290)</option>
                                                <option value="+1">🇰🇳 Saint Kitts and Nevis (+1)</option>
                                                <option value="+1">🇱🇨 Saint Lucia (+1)</option>
                                                <option value="+590">🇲🇫 Saint Martin (+590)</option>
                                                <option value="+508">🇵🇲 Saint Pierre and Miquelon (+508)</option>
                                                <option value="+1">🇻🇨 Saint Vincent and the Grenadines (+1)</option>
                                                <option value="+685">🇼🇸 Samoa (+685)</option>
                                                <option value="+378">🇸🇲 San Marino (+378)</option>
                                                <option value="+239">🇸🇹 Sao Tome and Principe (+239)</option>
                                                <option value="+966">🇸🇦 Saudi Arabia (+966)</option>
                                                <option value="+221">🇸🇳 Senegal (+221)</option>
                                                <option value="+381">🇷🇸 Serbia (+381)</option>
                                                <option value="+248">🇸🇨 Seychelles (+248)</option>
                                                <option value="+232">🇸🇱 Sierra Leone (+232)</option>
                                                <option value="+65">🇸🇬 Singapore (+65)</option>
                                                <option value="+1">🇸🇽 Sint Maarten (+1)</option>
                                                <option value="+421">🇸🇰 Slovakia (+421)</option>
                                                <option value="+386">🇸🇮 Slovenia (+386)</option>
                                                <option value="+677">🇸🇧 Solomon Islands (+677)</option>
                                                <option value="+252">🇸🇴 Somalia (+252)</option>
                                                <option value="+27">🇿🇦 South Africa (+27)</option>
                                                <option value="+82">🇰🇷 South Korea (+82)</option>
                                                <option value="+211">🇸🇸 South Sudan (+211)</option>
                                                <option value="+34">🇪🇸 Spain (+34)</option>
                                                <option value="+94">🇱🇰 Sri Lanka (+94)</option>
                                                <option value="+249">🇸🇩 Sudan (+249)</option>
                                                <option value="+597">🇸🇷 Suriname (+597)</option>
                                                <option value="+47">🇸🇯 Svalbard and Jan Mayen (+47)</option>
                                                <option value="+268">🇸🇿 Swaziland (+268)</option>
                                                <option value="+46">🇸🇪 Sweden (+46)</option>
                                                <option value="+41">🇨🇭 Switzerland (+41)</option>
                                                <option value="+963">🇸🇾 Syria (+963)</option>
                                                <option value="+886">🇹🇼 Taiwan (+886)</option>
                                                <option value="+992">🇹🇯 Tajikistan (+992)</option>
                                                <option value="+255">🇹🇿 Tanzania (+255)</option>
                                                <option value="+66">🇹🇭 Thailand (+66)</option>
                                                <option value="+228">🇹🇬 Togo (+228)</option>
                                                <option value="+690">🇹🇰 Tokelau (+690)</option>
                                                <option value="+676">🇹🇴 Tonga (+676)</option>
                                                <option value="+1">🇹🇹 Trinidad and Tobago (+1)</option>
                                                <option value="+216">🇹🇳 Tunisia (+216)</option>
                                                <option value="+90">🇹🇷 Turkey (+90)</option>
                                                <option value="+993">🇹🇲 Turkmenistan (+993)</option>
                                                <option value="+1">🇹🇨 Turks and Caicos Islands (+1)</option>
                                                <option value="+688">🇹🇻 Tuvalu (+688)</option>
                                                <option value="+1">🇻🇮 U.S. Virgin Islands (+1)</option>
                                                <option value="+256">🇺🇬 Uganda (+256)</option>
                                                <option value="+380">🇺🇦 Ukraine (+380)</option>
                                                <option value="+971">🇦🇪 United Arab Emirates (+971)</option>
                                                <option value="+44">🇬🇧 United Kingdom (+44)</option>
                                                <option value="+1">🇺🇸 United States (+1)</option>
                                                <option value="+598">🇺🇾 Uruguay (+598)</option>
                                                <option value="+998">🇺🇿 Uzbekistan (+998)</option>
                                                <option value="+678">🇻🇺 Vanuatu (+678)</option>
                                                <option value="+379">🇻🇦 Vatican (+379)</option>
                                                <option value="+58">🇻🇪 Venezuela (+58)</option>
                                                <option value="+84">🇻🇳 Vietnam (+84)</option>
                                                <option value="+681">🇼🇫 Wallis and Futuna (+681)</option>
                                                <option value="+212">🇪🇭 Western Sahara (+212)</option>
                                                <option value="+967">🇾🇪 Yemen (+967)</option>
                                                <option value="+260">🇿🇲 Zambia (+260)</option>
                                                <option value="+263">🇿🇼 Zimbabwe (+263)</option>
                                            </select>
                                            <input
                                                type="tel"
                                                {...register('phone')}
                                                className={`flex-1 px-3 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500`}
                                                placeholder="Enter phone number"
                                            />
                                        </div>
                                    </div>

                                    {/* Preferred Contact Method */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Reply Method *</label>
                                        <div className="space-y-2">
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    value="email"
                                                    {...register('preferredContact')}
                                                    className="h-4 w-4 text-amber-600 focus:ring-amber-500"
                                                />
                                                <span className="ml-2 text-gray-700">📧 Email</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    value="whatsapp"
                                                    {...register('preferredContact')}
                                                    className="h-4 w-4 text-amber-600 focus:ring-amber-500"
                                                />
                                                <span className="ml-2 text-gray-700">💬 WhatsApp</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    value="call"
                                                    {...register('preferredContact')}
                                                    className="h-4 w-4 text-amber-600 focus:ring-amber-500"
                                                />
                                                <span className="ml-2 text-gray-700">📞 Phone Call</span>
                                            </label>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Additional Message (Optional)</label>
                                        <textarea
                                            rows={3}
                                            {...register('message')}
                                            className={`w-full px-3 py-2 border ${errors.message ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500`}
                                            placeholder="Any specific requirements or questions"
                                        />
                                        {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>}
                                    </div>
                                    
                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowQuotationModal(false)}
                                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isLoading ? 'Sending...' : 'Submit Request'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}

            <Footer />
        </main>
    );
}