'use strict';

// Load environment variables from .env file
require('dotenv').config();

const axios = require('axios');

// Articles inspired by SumUp Pay support content
// Source: https://www.sumup.com/en-gb/pay/support/
// Content below is summarized and rewritten for testing purposes.
// Each article includes a categoryName to organize content in Strapi
const sumupArticles = [
  // Setting up and managing your profile
  {
    title: 'What is SumUp Pay? Overview and basics',
    categoryName: 'Profile & Security',
    body: `SumUp Pay is an e-money wallet with a virtual Mastercard you can use online and in-store. You can earn cashback, send and receive money, and manage balances. In the UK, the service is regulated by the FCA under the Electronic Money Regulations.`
  },
  {
    title: 'Is SumUp Pay free to use?',
    categoryName: 'Profile & Security',
    body: `There are no fees for standard use such as paying merchants, sending money to contacts, or receiving payments. Some external providers (e.g., ATMs) may add their own fees in specific scenarios.`
  },
  {
    title: 'Why identity verification (KYC) is required',
    categoryName: 'Profile & Security',
    body: `Because SumUp operates as an authorised Payment Institution, users must pass a Know Your Customer (KYC) check. You provide personal details, images of a valid photo ID, and a selfie to confirm identity. Verification unlocks key features such as top-ups, cashback, and transfers.`
  },
  {
    title: 'Identity document requirements for KYC',
    categoryName: 'Profile & Security',
    body: `Use a valid, non-expired ID with a clear photo. The name on your profile must match the ID. Upload high-quality images that show the entire document to avoid delays.`
  },
  {
    title: 'Securing your profile with Multi-Factor Authentication (MFA)',
    categoryName: 'Profile & Security',
    body: `Enable MFA in your profile settings. When logging in on a new device, you may need to confirm via device security and email. MFA adds an extra layer of protection for your funds and activity.`
  },
  {
    title: 'Where to find your consumer code',
    categoryName: 'Profile & Security',
    body: `Open the app, tap the button in the top-right of the home screen, and scroll to the bottom. Your 8-digit consumer code helps Support verify your identity. Don’t share it publicly; only provide it to the official Support team when asked.`
  },

  // Sending and receiving money
  {
    title: 'Your personal QR code: what it is and where to find it',
    categoryName: 'Transfers',
    body: `Your personal QR code is unique to your profile. Others can scan it to view your profile and send or request money if they use SumUp Pay. Find it via the Scan tab > My code, or through your profile under Get paid.`
  },
  {
    title: 'Sending limits for transfers',
    categoryName: 'Transfers',
    body: `Transfer limits may apply. Typical examples include per-transfer, daily, and monthly caps. Larger amounts may require additional checks to keep transfers secure and compliant.`
  },
  {
    title: 'Receiving limits and timing',
    categoryName: 'Transfers',
    body: `There’s no strict limit for bank transfers into your account, though larger transfers can take longer due to fraud checks. If topping up by card, daily and weekly caps can apply with a limited number of top-ups per day.`
  },
  {
    title: 'Getting paid by people who don’t use SumUp Pay',
    categoryName: 'Transfers',
    body: `Non-users can still pay you via a secure link and checkout page. They’ll receive a link and can complete payment on the web if they don’t have the app. Amounts may be capped for guest checkout.`
  },
  {
    title: 'How SumUp verifies your bank transfers',
    categoryName: 'Transfers',
    body: `Transfers use name and account detail checks to reduce misdirected payments. This helps make sure your money reaches the correct recipient and prevents errors.`
  },

  // Wallet and payment methods
  {
    title: 'Topping up your SumUp Pay balance',
    categoryName: 'Wallet',
    body: `Top up using a linked card or by bank transfer to your account number and sort code. Bank transfers can be sent from your bank at any time, and you can also withdraw back to your bank.`
  },
  {
    title: 'Updating or changing your payment cards',
    categoryName: 'Wallet',
    body: `Manage cards in Profile > Payment methods. You can deactivate existing cards or add new ones. Cards can’t be edited after adding; remove and re-add instead. Limits apply to how many new cards you can add in a period.`
  },
  {
    title: 'Supported cards for adding money',
    categoryName: 'Wallet',
    body: `In the UK, supported options typically include UK-issued debit and prepaid cards. Some card types—such as credit cards or non-UK cards—are not supported for top-ups.`
  },

  // SumUp Pay Mastercard
  {
    title: 'Fees and cash withdrawals with your SumUp Pay Mastercard',
    categoryName: 'Card',
    body: `The card is free. You have a small number of free ATM withdrawals per month (domestic and international combined). After the free allocation, a fixed percentage fee per withdrawal applies. ATM operators might charge additional fees independently.`
  },
  {
    title: 'Using your virtual card at cardless ATMs',
    categoryName: 'Card',
    body: `You can withdraw cash at compatible contactless ATMs using your virtual card through a mobile wallet. Hold your device to the contactless symbol and enter your PIN. You can set or change the PIN in the app.`
  },
  {
    title: 'Unsupported transactions and restricted categories',
    categoryName: 'Card',
    body: `Some transaction types (e.g., certain wallet payments or gambling) are not supported. Refer to the latest service terms for restricted categories.`
  },
  {
    title: 'What to do if you see an unrecognised transaction',
    categoryName: 'Card',
    body: `Freeze your card in the app immediately (Card > Freeze). Contact Support if you need more help. You can unfreeze the card at any time. For disputed charges, the Support team will guide you through next steps.`
  },
  {
    title: 'Why a business sees a failed transaction but your card was charged',
    categoryName: 'Card',
    body: `Occasionally, holds or temporary authorisations can appear even if a merchant sees a failure. These typically reverse automatically. If a charge remains, contact Support with transaction details.`
  },

  // Spaces
  {
    title: 'Spaces: Creating and managing savings goals',
    categoryName: 'Spaces',
    body: `Create up to a set number of Spaces to organise money by goals. Each Space can have its own name, emoji, colour, and even account details for transfers. Schedule recurring transfers and move money between Spaces and your main balance.`
  },
  {
    title: 'Shared Spaces: inviting and managing members',
    categoryName: 'Spaces',
    body: `Create a Shared Space to manage money with others who also use SumUp Pay. Invite members, track transfers, and set a goal. The Space owner retains legal ownership of funds; members are granted permissions to view and manage money.`
  },
  {
    title: 'Editing, deleting, and leaving a Space',
    categoryName: 'Spaces',
    body: `You can edit or delete a Space from the Space menu. Deleting a Space moves its funds back to your main balance. For Shared Spaces, only the owner can delete. Members can leave a Shared Space at any time.`
  },

  // Bill Splitting
  {
    title: 'How to use Bill Splitting in the app',
    categoryName: 'Bill Splitting',
    body: `Open a paid transaction and choose Split bill. Select contacts, set equal or custom amounts, and send requests. Track payment status in real time. Only payments to businesses are eligible for splitting.`
  },
  {
    title: 'Splitting with friends who don’t have the app',
    categoryName: 'Bill Splitting',
    body: `Non-users can pay through a web page using card details or Apple/Google Pay. You’ll see updates as friends pay, and the funds will appear in your main balance.`
  },
  {
    title: 'Cancelling or editing a split request',
    categoryName: 'Bill Splitting',
    body: `A split can be cancelled only if no one has paid yet. If at least one participant paid, the request can’t be cancelled. Participants can decline a request if needed.`
  },

  // Promotions and referrals
  {
    title: 'Referral programme basics and rewards',
    categoryName: 'Promotions',
    body: `Refer friends and earn rewards once they complete required steps. Rewards are granted within a stated timeframe after successful completion. Both accounts usually need to be verified and in good standing to be eligible.`
  },
  {
    title: 'Adding a promo code in the app',
    categoryName: 'Promotions',
    body: `Go to the profile menu and select Enter a code to redeem a promo. Codes may have eligibility and time limits. Check terms for details.`
  },

  // Paying a SumUp merchant
  {
    title: 'Paying via QR code at participating merchants',
    categoryName: 'Paying Merchants',
    body: `Scan a merchant’s QR code in-store or on their device or display. The app shows the amount and merchant name; confirm to complete payment. This is quick, secure, and does not require a card present.`
  },
  {
    title: 'How payment links work',
    categoryName: 'Paying Merchants',
    body: `Merchants can send you a payment link by email, SMS, or messaging apps. Tapping the link opens the app and displays the amount. Confirm to pay using your selected method or balance.`
  },
  {
    title: 'Avoiding cash advance fees on payment links',
    categoryName: 'Paying Merchants',
    body: `Some banks treat certain card payments as cash advances. To avoid potential fees, consider paying with your wallet balance or a linked debit card where supported.`
  },

  // Support
  {
    title: 'Didn’t find what you need? Contact Support',
    categoryName: 'Support',
    body: `If you can’t find an answer in the help centre, contact the Support team from within the app. Prepare your consumer code and relevant details to speed up troubleshooting.`
  }
];

// Category descriptions used when creating categories (if missing)
const categoryDescriptions = {
  'Profile & Security': 'Account, verification (KYC), MFA and profile essentials',
  'Transfers': 'Sending, receiving, limits and verification checks',
  'Wallet': 'Top-ups, payment methods and supported cards',
  'Card': 'SumUp Pay Mastercard usage, fees, withdrawals and disputes',
  'Spaces': 'Personal and Shared Spaces, goals and transfers',
  'Bill Splitting': 'Split requests, non-app participants and cancellations',
  'Promotions': 'Referral programme, promo codes and rewards',
  'Paying Merchants': 'QR code payments and payment links',
  'Support': 'Getting help and contacting support'
};

async function addSumupArticles() {
  const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';

  console.log(`📝 Adding ${sumupArticles.length} SumUp Pay articles to: ${STRAPI_URL}`);

  const apiToken = process.env.STRAPI_API_TOKEN;
  const email = process.env.STRAPI_EMAIL;
  const password = process.env.STRAPI_PASSWORD;

  let token;

  try {
    if (apiToken) {
      console.log('🔐 Using API token for authentication...');
      token = apiToken;
      console.log('✅ API token authenticated\n');
    } else if (email && password) {
      console.log('🔐 Authenticating with email/password...');
      const authResponse = await axios.post(`${STRAPI_URL}/admin/login`, { email, password }, { headers: { 'Content-Type': 'application/json' } });
      token = authResponse.data.data.token;
      console.log('✅ Authenticated successfully\n');
    } else {
      console.error('❌ Authentication credentials required');
      process.exit(1);
    }

    // Ensure categories exist and build a name->id map
    console.log('📂 Ensuring categories exist...');
    const categoryNameToId = {};
    const uniqueCategoryNames = Array.from(new Set(sumupArticles.map(a => a.categoryName)));

    for (const name of uniqueCategoryNames) {
      try {
        const authHeader = { Authorization: `Bearer ${token}` };

        // Try to find existing category by name
        const searchRes = await axios.get(
          `${STRAPI_URL}/api/categories`,
          {
            params: { 'filters[name][$eq]': name, 'pagination[pageSize]': 1 },
            headers: { ...authHeader }
          }
        );

        if (Array.isArray(searchRes.data?.data) && searchRes.data.data.length > 0) {
          categoryNameToId[name] = searchRes.data.data[0].id;
          continue;
        }

        // Create if not found
        const createRes = await axios.post(
          `${STRAPI_URL}/api/categories`,
          { data: { name, description: categoryDescriptions[name] || name } },
          { headers: { ...authHeader, 'Content-Type': 'application/json' } }
        );
        categoryNameToId[name] = createRes.data.data.id;
      } catch (e) {
        console.error(`⚠️  Could not ensure category "${name}":`, e.response?.data || e.message);
      }
    }

    console.log('📝 Creating articles...\n');
    let created = 0;

    for (const article of sumupArticles) {
      try {
        const authHeader = { Authorization: `Bearer ${token}` };

        const createResponse = await axios.post(
          `${STRAPI_URL}/api/articles`,
          { data: { title: article.title, body: article.body, category: categoryNameToId[article.categoryName] } },
          { headers: { ...authHeader, 'Content-Type': 'application/json' } }
        );

        const docId = createResponse.data.data.documentId;
        console.log(`✅ Created draft: "${article.title}"`);

        await axios.put(
          `${STRAPI_URL}/api/articles/${docId}`,
          { data: { publishedAt: new Date().toISOString() } },
          { headers: { ...authHeader, 'Content-Type': 'application/json' } }
        );

        console.log(`✅ Published: "${article.title}"`);
        created++;
      } catch (error) {
        console.error(`❌ Error creating "${article.title}":`, error.response?.data || error.message);
      }
    }

    console.log(`\n🎉 Successfully added ${created} SumUp Pay articles!`);
    console.log('📦 The articles have been automatically indexed in Meilisearch.');
  } catch (error) {
    console.error('❌ Error adding SumUp Pay articles:', error.response?.data || error.message);
    process.exit(1);
  }

  process.exit(0);
}

addSumupArticles().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});


