import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import FallbackImage from '../components/FallbackImage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Send, ShoppingCart, Plus, Minus, Package, Truck, CheckCircle, Tag, Clock } from 'lucide-react-native';
import { COLORS, SPACING } from '../services/theme';
import { useChatbot } from '../hooks/useChatbot';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { triggerLight, triggerSuccess } from '../utils/Haptics';

const SUGGESTIONS = ["Order Groceries 🛒", "Best Offers 🎁", "Track Order 🚚", "Quick Order ⚡", "View Cart", "Help"];
const CAT_ICONS = { Fruits: '🍎', Vegetables: '🥦', Dairy: '🥛', Bakery: '🥖', Beverages: '🥤', Snacks: '🍿', Meat: '🍗', Pantry: '🏪', 'Cooking Ingredients': '🧂' };

export default function ChatScreen({ navigation }) {
  const { messages, isTyping, sendMessage, sendInteractiveCommand, fetchCategoryProducts, addQuickBotMsg } = useChatbot();
  const { cartItems, updateQuantity, getCartTotal, addToCart } = useCart();
  const { changeLanguage } = useLanguage();
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef(null);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (inputText.trim().length === 0) return;
    sendMessage(inputText.trim());
    setInputText('');
  };

  // --- WIDGET RENDERERS ---

  const renderWelcomeActions = () => (
    <View style={styles.pillWrap}>
      {[
        { label: '🛒 Order Groceries', cmd: 'order groceries' },
        { label: '🎁 Best Offers', cmd: 'best offers' },
        { label: '🚚 Track Order', cmd: 'track order' },
        { label: '⚡ Quick Order', cmd: 'quick order' },
        { label: '🛍️ View Cart', cmd: 'view cart' },
      ].map(opt => (
        <TouchableOpacity key={opt.cmd} style={styles.actionPill} onPress={() => sendInteractiveCommand(opt.cmd)}>
          <Text style={styles.actionPillText}>{opt.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderCartWidget = () => {
    const total = getCartTotal();
    return (
      <View style={styles.widgetBox}>
        <View style={styles.widgetHeader}>
          <ShoppingCart size={18} color={COLORS.primary} />
          <Text style={styles.widgetTitle}>Your Cart ({cartItems.length} items)</Text>
        </View>
        {cartItems.map(item => (
          <View key={item.id} style={styles.cartRow}>
            <Text numberOfLines={1} style={styles.cartItemName}>{item.name}</Text>
            <View style={styles.cartActions}>
              <TouchableOpacity onPress={() => { triggerLight(); updateQuantity(item.id, item.quantity - 1); }} style={styles.qtyBtn}><Minus size={12}/></TouchableOpacity>
              <Text style={styles.qtyText}>{item.quantity}</Text>
              <TouchableOpacity onPress={() => { triggerLight(); updateQuantity(item.id, item.quantity + 1); }} style={styles.qtyBtn}><Plus size={12}/></TouchableOpacity>
            </View>
            <Text style={styles.cartPrice}>₹{((item.price ?? 0) * item.quantity).toFixed(0)}</Text>
          </View>
        ))}
        <View style={styles.cartTotalRow}>
          <Text style={styles.totalLabel}>Total</Text>
           <Text style={styles.totalVal}>₹{(total ?? 0).toFixed(0)}</Text>
        </View>
        <TouchableOpacity style={styles.checkoutBtn} onPress={() => { navigation.goBack(); navigation.navigate('Checkout'); }}>
          <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderAllCategoriesWidget = (categories) => (
    <View style={styles.catGrid}>
      {categories.map(cat => (
        <TouchableOpacity key={cat.name || cat._id} style={styles.catCard} onPress={() => fetchCategoryProducts(cat.name)}>
          <Text style={styles.catIcon}>{CAT_ICONS[cat.name] || '📦'}</Text>
          <Text style={styles.catLabel}>{cat.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderCategoryProductsWidget = (data) => {
    if (!data) return null;
    const { products } = data;
    return (
      <View style={styles.widgetBox}>
        {products.slice(0, 10).map(product => (
          <View key={product.id} style={styles.productRow}>
            <FallbackImage source={{ uri: product.image }} style={styles.prodImg} />
            <View style={styles.prodInfo}>
              <Text numberOfLines={1} style={styles.prodName}>{product.name}</Text>
              <Text style={styles.prodMeta}>{product.unit || '1 kg'}</Text>
              <Text style={styles.prodPrice}>₹{product.price}</Text>
            </View>
            <TouchableOpacity style={styles.addBtn} onPress={() => {
              triggerSuccess();
              addToCart(product);
              addQuickBotMsg(`Added ${product.name} to cart! ✅ (₹${product.price})`);
            }}>
              <Plus size={14} color="#fff" />
              <Text style={styles.addBtnText}>ADD</Text>
            </TouchableOpacity>
          </View>
        ))}
        {products.length > 10 && <Text style={styles.moreText}>+ {products.length - 10} more items</Text>}
      </View>
    );
  };

  const renderOfferCampaignsWidget = (offers) => (
    <View style={{ gap: 8 }}>
      {offers.map(offer => {
        const [bg1] = offer.bannerBg;
        const isPromo = offer.type === 'promo';
        return (
          <TouchableOpacity key={offer.id} style={[styles.offerCard, { backgroundColor: bg1 }]}
            onPress={() => { if (!isPromo) { navigation.goBack(); navigation.navigate('CampaignScreen', { campaign: offer }); } else { navigation.goBack(); navigation.navigate('ProductList'); } }}>
            <Text style={styles.offerIcon}>{offer.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.offerTitle}>{offer.title}</Text>
              <Text style={styles.offerSub}>{offer.subtitle}</Text>
            </View>
            {!isPromo && (
              <View style={styles.offerBadge}>
                <Text style={styles.offerBadgeText}>{offer.discountPercent}% OFF</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderOrderTrackerWidget = (order) => {
    if (!order) return null;
    const steps = ['Placed', 'Packed', 'Out for Delivery', 'Delivered'];
    const currentIdx = steps.indexOf(order.status);
    const isCancelled = order.status === 'Cancelled';
    return (
      <View style={styles.widgetBox}>
        <Text style={styles.trackerOrderId}>Order #{order.id?.slice(-6)} • ₹{order.totalAmount}</Text>
        {isCancelled ? (
          <View style={[styles.trackStep, { backgroundColor: '#FEE2E2' }]}>
            <Text style={{ color: '#DC2626', fontWeight: '800', fontSize: 13 }}>❌ Order Cancelled</Text>
          </View>
        ) : (
          steps.map((step, i) => {
            const done = i <= currentIdx;
            const isCurrent = i === currentIdx;
            return (
              <View key={step} style={styles.trackStep}>
                <View style={[styles.trackDot, done && styles.trackDotDone, isCurrent && styles.trackDotCurrent]}>
                  {done ? <CheckCircle size={14} color="#fff" /> : <View style={styles.trackDotInner} />}
                </View>
                {i < steps.length - 1 && <View style={[styles.trackLine, done && styles.trackLineDone]} />}
                <Text style={[styles.trackLabel, done && styles.trackLabelDone, isCurrent && styles.trackLabelCurrent]}>{step}</Text>
              </View>
            );
          })
        )}
      </View>
    );
  };

  const renderHelpMenuWidget = () => (
    <View style={styles.pillWrap}>
      {[
        { label: 'Order Groceries 🛒', cmd: 'order groceries' },
        { label: 'Quick Order ⚡', cmd: 'quick order' },
        { label: 'Track Order 🚚', cmd: 'track order' },
        { label: 'View Cart 🛍️', cmd: 'view cart' },
        { label: 'Best Offers 🎁', cmd: 'best offers' },
        { label: 'Reorder 🔁', cmd: 'reorder' },
        { label: 'Clear Cart 🗑️', cmd: 'clear cart' },
        { label: 'Language 🌐', cmd: 'change language' },
        { label: 'Delivery Info 🛵', cmd: 'delivery charges' },
      ].map(opt => (
        <TouchableOpacity key={opt.label} style={styles.widgetPill} onPress={() => sendInteractiveCommand(opt.cmd)}>
          <Text style={styles.widgetPillText}>{opt.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderLanguageSelectorWidget = (currentLang) => (
    <View style={styles.pillWrap}>
      {['en', 'ta', 'te', 'kn', 'ml'].map(lang => (
        <TouchableOpacity key={lang} style={[styles.widgetPill, currentLang === lang && {backgroundColor: COLORS.primary}]} onPress={() => { triggerSuccess(); changeLanguage(lang); }}>
          <Text style={[styles.widgetPillText, currentLang === lang && {color: COLORS.white}]}>
            {lang === 'en' ? 'English' : lang === 'ta' ? 'தமிழ்' : lang === 'te' ? 'తెలుగు' : lang === 'kn' ? 'ಕನ್ನಡ' : 'മലയാളം'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderReorderWidget = (orderData) => {
    if (!orderData) return null;
    return (
      <View style={styles.widgetBox}>
        <Text style={{fontSize: 12, color: COLORS.gray[500], marginBottom: 8}}>Order #{orderData.id?.slice(-6)} — ₹{orderData.totalAmount}</Text>
        {(orderData.items || []).slice(0, 3).map((item, idx) => (
          <Text key={idx} numberOfLines={1} style={{fontSize: 13, fontWeight: '600', color: COLORS.foreground}}>• {item.quantity}x {item.name}</Text>
        ))}
        {(orderData.items || []).length > 3 && <Text style={{fontSize: 11, color: COLORS.gray[400], marginTop: 4}}>+ {orderData.items.length - 3} more items...</Text>}
        <TouchableOpacity style={styles.checkoutBtn} onPress={() => {
          triggerSuccess();
          (orderData.items || []).forEach(i => addToCart(i, i.quantity));
          sendInteractiveCommand("view cart");
        }}>
          <Text style={styles.checkoutBtnText}>Copy Items to Cart</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderWidget = (item) => {
    switch (item.widgetType) {
      case 'welcome_actions': return renderWelcomeActions();
      case 'cart_summary': return renderCartWidget();
      case 'all_categories': return renderAllCategoriesWidget(item.widgetData);
      case 'category_products': return renderCategoryProductsWidget(item.widgetData);
      case 'offer_campaigns': return renderOfferCampaignsWidget(item.widgetData);
      case 'order_tracker': return renderOrderTrackerWidget(item.widgetData);
      case 'help_menu': return renderHelpMenuWidget();
      case 'language_selector': return renderLanguageSelectorWidget(item.widgetData);
      case 'reorder_summary': return renderReorderWidget(item.widgetData);
      case 'quick_order_success': return renderOrderTrackerWidget(item.widgetData);
      default: return null;
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.type === 'user';
    // Skip echoed confirmation messages
    if (isUser && item.text.startsWith('✅')) return null;
    return (
      <View style={[styles.msgWrapper, isUser ? styles.msgWrapperUser : styles.msgWrapperBot]}>
        {!isUser && <View style={styles.botAvatar}><Text style={{fontSize: 16}}>🤖</Text></View>}
        <View style={isUser ? styles.msgBubbleUser : styles.msgBubbleBot}>
          <Text style={isUser ? styles.msgTextUser : styles.msgTextBot}>{item.text}</Text>
          {item.isWidget && <View style={{marginTop: 10}}>{renderWidget(item)}</View>}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft color={COLORS.foreground} size={24} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>FreshKart AI</Text>
          <Text style={styles.headerSub}>Online • Ready to assist</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <FlatList ref={flatListRef} data={messages} renderItem={renderMessage} keyExtractor={item => item.id} contentContainerStyle={styles.chatContent} showsVerticalScrollIndicator={false}
          ListFooterComponent={isTyping ? <View style={styles.typingRow}><View style={styles.botAvatar}><Text style={{fontSize: 16}}>🤖</Text></View><Text style={styles.typingText}>Typing...</Text></View> : null}
        />
        <View>
          <FlatList horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggsContent} data={SUGGESTIONS} keyExtractor={it=>it}
            renderItem={({item}) => (<TouchableOpacity style={styles.suggPill} onPress={() => sendInteractiveCommand(item)}><Text style={styles.suggText}>{item}</Text></TouchableOpacity>)} />
        </View>
        <View style={styles.inputArea}>
          <TextInput style={styles.textInput} value={inputText} onChangeText={setInputText} placeholder="Type a message..." placeholderTextColor={COLORS.gray[400]} onSubmitEditing={handleSend} />
          <TouchableOpacity style={[styles.sendBtn, !inputText.trim() && { opacity: 0.5 }]} onPress={handleSend} disabled={!inputText.trim()}>
            <Send size={20} color={COLORS.white} style={{ marginLeft: 2 }} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, height: 60, backgroundColor: COLORS.white, borderBottomWidth: 1, borderColor: COLORS.gray[100] },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.gray[50], justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: COLORS.foreground, textAlign: 'center' },
  headerSub: { fontSize: 11, color: COLORS.emerald[600], textAlign: 'center', fontWeight: '700' },
  chatContent: { padding: SPACING.md, paddingBottom: 20 },
  msgWrapper: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-start', maxWidth: '88%' },
  msgWrapperUser: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
  msgWrapperBot: { alignSelf: 'flex-start' },
  botAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.indigo[100], justifyContent: 'center', alignItems: 'center', marginRight: 8, marginTop: 4 },
  msgBubbleUser: { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20, borderBottomRightRadius: 4 },
  msgBubbleBot: { backgroundColor: COLORS.white, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20, borderBottomLeftRadius: 4, shadowColor: COLORS.foreground, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 1 },
  msgTextUser: { color: COLORS.white, fontSize: 14, lineHeight: 20 },
  msgTextBot: { color: COLORS.foreground, fontSize: 14, lineHeight: 20 },
  typingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  typingText: { fontSize: 12, color: COLORS.gray[400], fontStyle: 'italic', marginLeft: 4 },
  suggsContent: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  suggPill: { backgroundColor: COLORS.indigo[50], paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: COLORS.indigo[100] },
  suggText: { color: COLORS.indigo[700], fontSize: 13, fontWeight: '700' },
  inputArea: { flexDirection: 'row', padding: SPACING.md, backgroundColor: COLORS.white, borderTopWidth: 1, borderColor: COLORS.gray[100], alignItems: 'center' },
  textInput: { flex: 1, height: 48, backgroundColor: COLORS.gray[50], borderRadius: 24, paddingHorizontal: 20, fontSize: 15 },
  sendBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginLeft: 12, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3 },

  // Widgets
  widgetBox: { backgroundColor: COLORS.gray[50], borderRadius: 16, padding: 14, minWidth: 220, borderWidth: 1, borderColor: COLORS.gray[100] },
  widgetHeader: { flexDirection: 'row', gap: 6, alignItems: 'center', marginBottom: 12 },
  widgetTitle: { fontSize: 14, fontWeight: '800', color: COLORS.foreground },
  pillWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  widgetPill: { backgroundColor: COLORS.white, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: COLORS.gray[200] },
  widgetPillText: { fontSize: 12, fontWeight: '700', color: COLORS.foreground },
  actionPill: { backgroundColor: COLORS.primary + '10', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, borderWidth: 1, borderColor: COLORS.primary + '30' },
  actionPillText: { fontSize: 13, fontWeight: '800', color: COLORS.primary },
  checkoutBtn: { backgroundColor: COLORS.primary, paddingVertical: 10, borderRadius: 16, marginTop: 12, alignItems: 'center' },
  checkoutBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 12 },

  // Cart
  cartRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  cartItemName: { fontSize: 12, color: COLORS.foreground, flex: 1, paddingRight: 10 },
  cartActions: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 12, padding: 2 },
  qtyBtn: { width: 22, height: 22, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.gray[100], borderRadius: 11 },
  qtyText: { fontSize: 12, fontWeight: '800', marginHorizontal: 8 },
  cartPrice: { fontSize: 12, fontWeight: '800', marginLeft: 10, width: 45, textAlign: 'right' },
  cartTotalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderColor: COLORS.gray[200] },
  totalLabel: { fontSize: 13, fontWeight: '700', color: COLORS.gray[500] },
  totalVal: { fontSize: 14, fontWeight: '900', color: COLORS.primary },

  // Categories
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catCard: { backgroundColor: COLORS.white, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, borderWidth: 1, borderColor: COLORS.gray[100], alignItems: 'center', flexDirection: 'row', gap: 6 },
  catIcon: { fontSize: 18 },
  catLabel: { fontSize: 13, fontWeight: '700', color: COLORS.foreground },

  // Products
  productRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderColor: COLORS.gray[100] },
  prodImg: { width: 44, height: 44, borderRadius: 10, backgroundColor: COLORS.gray[100] },
  prodInfo: { flex: 1, marginLeft: 10 },
  prodName: { fontSize: 13, fontWeight: '700', color: COLORS.foreground },
  prodMeta: { fontSize: 10, color: COLORS.gray[400], marginTop: 1 },
  prodPrice: { fontSize: 13, fontWeight: '900', color: COLORS.primary, marginTop: 2 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  addBtnText: { fontSize: 11, fontWeight: '900', color: '#fff' },
  moreText: { textAlign: 'center', fontSize: 11, color: COLORS.gray[400], marginTop: 8 },

  // Offers
  offerCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, gap: 10 },
  offerIcon: { fontSize: 28 },
  offerTitle: { fontSize: 15, fontWeight: '900', color: '#fff' },
  offerSub: { fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  offerBadge: { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  offerBadgeText: { fontSize: 10, fontWeight: '900', color: '#fff' },

  // Tracker
  trackerOrderId: { fontSize: 12, fontWeight: '700', color: COLORS.gray[500], marginBottom: 12 },
  trackStep: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, position: 'relative' },
  trackDot: { width: 26, height: 26, borderRadius: 13, backgroundColor: COLORS.gray[200], justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  trackDotDone: { backgroundColor: COLORS.emerald[500] },
  trackDotCurrent: { backgroundColor: COLORS.primary, borderWidth: 3, borderColor: COLORS.primary + '40' },
  trackDotInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.gray[300] },
  trackLine: { position: 'absolute', left: 12, top: 26, width: 2, height: 14, backgroundColor: COLORS.gray[200] },
  trackLineDone: { backgroundColor: COLORS.emerald[500] },
  trackLabel: { fontSize: 13, fontWeight: '600', color: COLORS.gray[400], marginLeft: 12 },
  trackLabelDone: { color: COLORS.emerald[600] },
  trackLabelCurrent: { color: COLORS.primary, fontWeight: '900' },
});
