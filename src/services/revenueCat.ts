import Purchases, {
  type PurchasesOffering,
  type PurchasesPackage,
  LOG_LEVEL,
} from 'react-native-purchases';
import { Platform } from 'react-native';
import { PREMIUM_ENTITLEMENT_ID } from '../constants';

const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '';
const ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? '';

export async function initRevenueCat(): Promise<void> {
  const apiKey = Platform.OS === 'ios' ? IOS_KEY : ANDROID_KEY;
  if (!apiKey) {
    console.warn('[RevenueCat] No API key found — running in mock mode');
    return;
  }

  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  }

  await Purchases.configure({ apiKey });
}

export async function getOfferings(): Promise<PurchasesOffering | null> {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch (err) {
    console.warn('[RevenueCat] getOfferings error:', err);
    return getMockOffering();
  }
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<boolean> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return !!customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID];
  } catch (err: any) {
    if (err.userCancelled) return false;
    throw err;
  }
}

export async function restorePurchases(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.restorePurchases();
    return !!customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID];
  } catch (err) {
    console.warn('[RevenueCat] restorePurchases error:', err);
    return false;
  }
}

export async function checkPremiumStatus(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return !!customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID];
  } catch (_) {
    return false;
  }
}

// Mock offering for development / when no RC key is set
function getMockOffering(): PurchasesOffering {
  const mockPackage = (identifier: string, price: string, period: string) =>
    ({
      identifier,
      packageType: identifier.includes('annual') ? 'ANNUAL' : 'MONTHLY',
      product: {
        identifier: `com.fitaicoach.${identifier}`,
        description: `FitAI Coach ${identifier}`,
        title: `FitAI Coach ${identifier}`,
        price: parseFloat(price.replace('$', '')),
        priceString: price,
        currencyCode: 'USD',
        subscriptionPeriod: period,
      },
      offeringIdentifier: 'default',
    }) as unknown as PurchasesPackage;

  return {
    identifier: 'default',
    serverDescription: 'Default offering',
    metadata: {},
    availablePackages: [
      mockPackage('monthly', '$9.99', 'P1M'),
      mockPackage('annual', '$59.99', 'P1Y'),
    ],
    lifetime: null,
    annual: mockPackage('annual', '$59.99', 'P1Y'),
    sixMonth: null,
    threeMonth: null,
    twoMonth: null,
    monthly: mockPackage('monthly', '$9.99', 'P1M'),
    weekly: null,
  } as unknown as PurchasesOffering;
}
