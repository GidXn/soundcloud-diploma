// Support section texts are taken from the Figma design (section "Support").
// There is no User agreement page in the design, so its text is a neutral placeholder.

export type SupportLine =
    | string
    | { text: string; indent?: boolean; email?: string; href?: string };

export type SupportBlock =
    | { type: "p"; text: string; email?: string }
    | { type: "h"; text: string }
    | { type: "card"; lines: SupportLine[]; highlight?: boolean };

export interface SupportPageData {
    slug: string;
    title: string;
    placeholder?: boolean;
    blocks: SupportBlock[];
}

const INFO_EMAIL = "info@allure.net";
const ADMIN_EMAIL = "admin@allure.net";

const dmca: SupportPageData = {
    slug: "dmca",
    title: "DMCA Policy Allure",
    blocks: [
        { type: "p", text: "📜 Allure respects the rights of all authors and copyright holders. We remove or restrict access to materials that violate copyright in accordance with the Digital Millennium Copyright Act (DMCA) and international law." },
        { type: "p", text: "If you believe that your copyrighted material has been published on our site without permission, you can file an official DMCA notice." },
        { type: "h", text: "1. How to file a DMCA complaint (Takedown Notice)" },
        {
            type: "card",
            lines: [
                "To ensure rapid processing of your request, please include the following details in your email:",
                "1.Identity of Complainant: Your Full Name or Company Name.",
                "2.Contact Information: A valid Email address for correspondence.",
                "3.Infringing Material: A direct link (URL) to the page on Allure where the disputed content is located.",
                "4.Proof of Ownership: A link to the original work or documentation confirming your rights to the content.",
                "5.Infringement Claim: A clear statement confirming that you consider the use of this material to be a violation of your rights.",
                "Good Faith Declaration: Please include the following statement in your notice:",
                { text: "\"I have a good faith belief that the use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.\"", indent: true },
                "6.Electronic Signature: Your Full Name (typed) acting as a signature.",
            ],
        },
        {
            type: "card",
            highlight: true,
            lines: ["Send all materials to email:", { text: "📧 ", email: INFO_EMAIL }],
        },
        { type: "h", text: "2. Counter-Notice" },
        {
            type: "card",
            lines: [
                "If you believe that your material was removed in error or due to misidentification, you may submit a counter-notification. Your appeal must include the following details:",
                "1.User Identity: Your Full Name.",
                "2.Reference: A link (URL) to the material that was removed or a clear description of where it appeared before removal.",
                "3.Statement of Error: A declaration explaining why you believe the removal was a mistake or misidentification.",
                "Consent to Disclosure: You must include the following confirmation statement:",
                { text: "\"I consent to the transfer of my contact information to the original copyright claimant for the purpose of resolving this dispute.\"", indent: true },
                "4.Electronic Signature: Your Full Name (typed) acting as a signature.",
            ],
        },
        { type: "p", text: "After receiving a counter-notice, we will forward it to the complainant. If he does not provide a legal response within 10–14 days, the material may be reinstated." },
        { type: "h", text: "3. Materials posted by authors" },
        { type: "p", text: "Allure works with independent artists who independently upload or send their own tracks." },
        {
            type: "card",
            lines: [
                "By uploading content to Allure, each artist explicitly confirms and warrants that:",
                "1.Ownership: They are the sole owner of the content or hold all necessary legal rights and authority to distribute it.",
                "2.License Grant: They grant Allure full permission and a valid license to use, display, and stream the material on the platform.",
                "3.Non-Infringement: The submitted content does not violate or infringe upon the intellectual property, privacy, or publicity rights of any third party.",
            ],
        },
        { type: "p", text: "If there is a dispute about authorship, we act in accordance with the DMCA and remove the material until it is resolved." },
        { type: "h", text: "4. Notice to copyright holders" },
        {
            type: "card",
            lines: [
                "If you have any concerns regarding the licensing status of specific content, Allure is fully prepared to provide:",
                "1.Artist Confirmation: Direct written confirmation from the author or rights holder.",
                "2.Documentation: Relevant documents or correspondence proving the legitimacy of the upload.",
                "3.Conflict Resolution: Any additional information required to resolve the dispute amicably and efficiently.",
            ],
        },
        { type: "h", text: "5. Violations and blocking" },
        {
            type: "card",
            lines: [
                "Allure maintains a strict approach to copyright protection. We reserve the right to permanently terminate the accounts of users or artists who are determined to be repeat infringers. This action may be taken at our sole discretion and without prior warning.",
            ],
        },
        { type: "h", text: "6. Contact information" },
        {
            type: "card",
            lines: [
                "Allure Copyright Agent\nFor all copyright inquiries and DMCA notices, please contact us directly:",
                { text: "📧 DMCA Email: ", email: INFO_EMAIL },
            ],
        },
        { type: "p", text: "Designated DMCA Agent" },
        { type: "p", text: "Allure Digital Services" },
        { type: "p", text: "DMCA Agent: Content Compliance Department" },
        { type: "h", text: "🔹 Address for legal notices" },
        { type: "card", lines: [{ text: "💼 Email: ", email: INFO_EMAIL }] },
        { type: "h", text: "🔹 Legal notice" },
        {
            type: "card",
            lines: [
                "All official copyright notices must be submitted directly to the email address listed above.",
                "Allure processes all DMCA requests in strict accordance with international law and reserves the right to suspend access to any disputed material pending a full review.",
            ],
        },
        { type: "h", text: "🔹 Good Faith Confirmation (Mandatory formula for appeals)" },
        {
            type: "card",
            lines: [
                "To ensure your complaint is legally valid, your notice must include the following verbatim statements:",
                "\"I have a good faith belief that the use of the copyrighted material described below is not authorized by the copyright owner, its agent, or the law.\"",
                "\"The information in this notice is accurate, and under penalty of perjury, I am authorized to act on behalf of the owner.\"",
            ],
        },
        { type: "h", text: "🔹 Request processing procedure" },
        {
            type: "card",
            lines: [
                "Counter-Notification Processing & Restoration",
                "1.Review Timeline: All counter-notifications are reviewed within 48–72 hours.",
                "2.Forwarding: A copy of the counter-notification will be forwarded to the original complainant (the party who filed the initial report).",
                "3.Restoration of Content: If the original complainant does not notify Allure that they have filed a legal action seeking a court order within 10–14 business days, the removed material may be reinstated.",
            ],
        },
    ],
};

const rightsHolders: SupportPageData = {
    slug: "rights-holders",
    title: "To the rights holders",
    blocks: [
        { type: "h", text: "⚖️ Copyright compliance" },
        {
            type: "card",
            lines: [
                "Allure is a publicly available music platform operating in accordance with current Ukrainian legislation, specifically the Law of Ukraine \"On Copyright and Related Rights\".",
                "Content on Allure is user-generated. The administration does not conduct preliminary moderation or verification of uploaded materials and is not the initiator of their placement.",
                "However, Allure strictly respects intellectual property rights. We are committed to protecting authors and will take necessary measures immediately upon receiving substantiated reports of copyright infringement.",
            ],
        },
        { type: "h", text: "📌 Responsibility of the parties" },
        {
            type: "card",
            lines: [
                "Users are solely responsible for the legality of the content they publish on Allure. By uploading materials, the user guarantees that they possess all necessary rights and licenses to distribute the relevant content.",
                "The Allure Administration assumes no liability for materials posted by users prior to receiving a formal notice of copyright infringement. Upon receipt of such a valid notification, the administration will take immediate action in accordance with our copyright complaint procedure.",
            ],
        },
        { type: "h", text: "⛔ Copyright Infringement Policy" },
        {
            type: "card",
            lines: [
                "The resource administration has a negative attitude towards any violations of copyright and related rights and supports a policy of prompt response to complaints from copyright holders (the \"notice and takedown\" principle).",
            ],
        },
        { type: "p", text: "Upon receipt of a properly completed notice of violation of rights, the administration may:" },
        {
            type: "card",
            lines: [
                "1.Temporary Restriction: Access to the disputed material will be immediately suspended pending investigation.",
                "2.Verification: The administration will conduct a review to verify the validity of the provided information and the claim.",
                "3.Removal: If the violation is confirmed, the material will be permanently removed from the platform.",
            ],
        },
        { type: "h", text: "📨 Filing a complaint by a copyright holder" },
        { type: "p", text: "If you are a copyright holder or his authorized representative and believe that your copyright or related rights are being violated on the Allure.net website, please send a request to:" },
        { type: "p", text: "Email: ", email: INFO_EMAIL },
        {
            type: "card",
            lines: [
                "1.URL of the Material: A direct link to the specific page on Allure where the infringing content is located.",
                "2.Content Description: A clear identification of the copyrighted work (Track Title, Artist Name, and other identifying details).",
                "3.Proof of Rights: Confirmation of your ownership or authority to act on behalf of the copyright owner (supporting documents may be requested).",
                "4.Contact Information: Your Full Name, Company Name (if applicable), and a valid Email address for correspondence.",
                "5.Legal Statement: A declaration that you are acting in good faith and that the information provided in the notice is accurate.",
            ],
        },
        { type: "h", text: "⏳ Consideration periods" },
        {
            type: "card",
            lines: [
                "Allure administration reviews all submitted applications within 5 (five) business days from the moment complete information is received.",
                "If necessary, we reserve the right to contact the applicant to request additional details or documentation to verify ownership rights.",
            ],
        },
        { type: "h", text: "⚠️ Important warning" },
        {
            type: "card",
            lines: [
                "The applicant confirms that they possess the legal authority to act on behalf of the copyright holder. By submitting a complaint, the user acknowledges that they are aware of the legal liability for providing false or misleading information in accordance with the legislation of Ukraine.",
                "The Allure administration implements reasonable technical and organizational measures to prevent the re-posting of materials for which a violation of rights has been previously confirmed.",
            ],
        },
        { type: "h", text: "💛 Pre-trial settlement" },
        {
            type: "card",
            lines: [
                "The Allure administration is committed to resolving disputes out of court and prioritizes constructive cooperation with copyright holders.",
            ],
        },
    ],
};

const performers: SupportPageData = {
    slug: "performers",
    title: "For performers",
    blocks: [
        { type: "p", text: "🎵 Are you an artist and want your music to appear on Allure? Cool, we will be happy to hear new names and high-quality tracks. So that we can publish the release, send us the following materials:" },
        { type: "h", text: "📥 What you need to send :" },
        {
            type: "card",
            lines: [
                "1.Artist / Project Name",
                "2.Track Title",
                "3.Cover Art (Square format, High Resolution)",
                "4.Lyrics (if applicable)",
                "5.Audio File (High Quality: MP3 320kbps / WAV / FLAC)",
                "⚠️ Note: Incomplete submissions will not be processed.",
                "Please indicate one of the following options:",
                "✅ Allow Download",
                "🚫 Streaming Only (Download Prohibited)",
                "Default Rule: If you do not specify a preference, downloading will be considered ALLOWED by default.",
            ],
        },
        { type: "h", text: "📨 Where to send tracks?" },
        { type: "card", lines: ["Send all materials to email:", { text: "📧 ", email: INFO_EMAIL }] },
        { type: "h", text: "🗓️ Accommodation conditions" },
        {
            type: "card",
            lines: [
                "1.Ownership & Rights: You are the original author of the track or possess all necessary rights, licenses, and permissions to distribute it.",
                "2.Accuracy & Non-infringement: All provided information is accurate, and the content does not violate the intellectual property rights, privacy, or other rights of any third party.",
                "3.Grant of License: You hereby grant Allure a non-exclusive, royalty-free, worldwide license to:",
                { text: "3.1. Host, publish, and distribute the track on the Allure platform.", indent: true },
                { text: "3.2. Publicly perform and stream the content (Online Playback).", indent: true },
                { text: "3.3. Store, encode, and technically process the materials as required for platform operation.", indent: true },
                { text: "3.4. Use the Cover Art, Track Title, and associated metadata for display and promotional purposes within the service.", indent: true },
            ],
        },
        { type: "p", text: "These rights are granted solely for the operation of the site and the promotion of your release within the Allure platform." },
        { type: "p", text: "You also confirm that posting the track on Allure does not violate any agreements with labels, distributors or other rights holders." },
        { type: "h", text: "❌ Track Removal" },
        {
            type: "card",
            lines: [
                "You retain full control over your content. You may contact us at any time to request:",
                "1.Deletion of a specific track.",
                "2.Complete removal of the Artist Profile.",
                "Upon receipt of your request, Allure guarantees the removal of the specified materials from the platform within 24 hours.",
            ],
        },
        { type: "p", text: "We are for honest music, respect for copyright and support for artists. Send your tracks - let them hear you🚀" },
    ],
};

const privacy: SupportPageData = {
    slug: "privacy-policy",
    title: "Privacy Policy",
    blocks: [
        { type: "p", text: "🔒This Privacy Policy of personal information (hereinafter referred to as the Policy) applies to all information that the Allure.net music online platform (hereinafter referred to as the Site, Administration) may obtain about Users when using the allure.net website, its services, feedback forms, account registration and other functions." },
        { type: "p", text: "Using the Site means the User's full consent to this Policy. If the User does not agree with the terms, he must stop using the Site." },
        { type: "h", text: "📌 1. What information do we collect" },
        {
            type: "card",
            lines: [
                { text: "1.1. Information You Provide Allure collects personal data that you voluntarily submit to us, including:", indent: true },
                "1.Identity Data: Name or Nickname (Pseudonym).",
                "2.Contact Data: Email address.",
                "3.Profile Information: Details provided in your account.",
                "4.Submission Data: Information transmitted via contact forms, upload forms, or other Site interfaces.",
                { text: "1.2. Automatically Collected Information When you access the Site, certain technical data is transmitted and recorded automatically:", indent: true },
                "1.Network Data: IP address.",
                "2.Tracking Technologies: Cookies and local storage data.",
                "3.Device & Browser Data: Browser type, version, and device specifications.",
                "4.Usage Logs: Access dates, times, visited pages, and navigation history.",
                "5.Technical Parameters: Connection logs and error reports.",
                "6.Interaction Data: Information regarding your interaction with specific Site features and functionality.",
                { text: "1.3. Additional Data", indent: true },
                "1.Any other information that you voluntarily choose to provide while utilizing the Site's services.",
            ],
        },
        { type: "h", text: "🎯 2. Purpose of data processing" },
        {
            type: "card",
            lines: [
                "2.1Allure processes your personal data for the following specific purposes:",
                "1.User Identification: To verify your identity and authenticate your access to your account.",
                "2.Service Provision: To provide full access to the Site's features, functionality, and content.",
                "3.Customer Support: To provide feedback, technical support, and respond to your inquiries.",
                "4.Dispute Resolution: To process specific requests, complaints, and copyright claims efficiently.",
                "5.Service Improvement: To analyze user behavior and optimize the performance and usability of the Site.",
                "6.Analytics: To compile internal statistics and conduct market research.",
                "7.Marketing & Advertising: To display relevant advertisements and personalized content based on your preferences.",
                "8.Legal Compliance: To ensure strict adherence to applicable laws and regulations, including the legislation of Ukraine.",
            ],
        },
        { type: "h", text: "🔘 3. Processing conditions and transfer to third parties" },
        {
            type: "card",
            lines: [
                "3.1. Confidentiality Commitment We are committed to protecting your privacy. Personal data is never sold, traded, or transferred to third parties without valid legal grounds.",
                "3.2. Conditions for Disclosure Your data may be shared or disclosed only under the following specific circumstances:",
                "1.User Consent: When you have given explicit permission to share your information.",
                "2.Service Providers: To trusted third-party partners essential for the operation of the Site (e.g., hosting providers, analytics services, payment processors), provided they agree to keep this information confidential.",
                "3.Legal Obligations: When disclosure is required by law, court order, or government regulation.",
                "4.Protection of Rights: To protect the rights, property, or safety of Allure, our users, or the public (e.g., fraud protection or copyright enforcement).",
                "3.3. Anonymized Data We reserve the right to use and share aggregated, anonymized data (information that does not identify you individually) for internal research, statistical analysis, and service improvement.",
            ],
        },
        { type: "h", text: "🍪 4. Cookies" },
        {
            type: "card",
            lines: [
                "Allure utilizes cookies and similar technologies to enhance your experience. We use cookies for the following specific purposes:",
                "1.Essential Functionality: To ensure the correct operation of the Site's core functions, security, and navigation.",
                "2.Analytics & Performance: To analyze user behavior, traffic sources, and usage patterns to improve our services.",
                "3.User Preferences: To save your settings and customize your interface for future visits.",
            ],
        },
        { type: "p", text: "The user can disable cookies in the browser settings, but this may affect the operation of the Site." },
        { type: "h", text: "🛡️ 5. Information protection" },
        {
            type: "card",
            lines: [
                "1.Unauthorized Access: Protecting data from illegal entry or viewing by unauthorized parties.",
                "2.Alteration & Manipulation: Preventing unauthorized modification, corruption, or tampering with data.",
                "3.Data Loss: Safeguarding against accidental loss, destruction, or damage.",
                "4.Unauthorized Disclosure: Preventing the illegal dissemination or distribution of private information.",
            ],
        },
        { type: "h", text: "👤 6. User Rights" },
        {
            type: "card",
            lines: [
                "You maintain full control over your personal information. You are entitled to the following rights:",
                "1.Right to Access: You may request confirmation as to whether or not your personal data is being processed and obtain a copy of the information we hold about you.",
                "2.Right to Rectification: You have the right to update, correct, or complete any inaccurate or incomplete personal data.",
                "3.Right to Erasure: You may request the permanent deletion of your account and personal data (\"Right to be Forgotten\").",
                "4.Right to Withdraw Consent: Where processing is based on consent, you have the right to withdraw your consent to data processing at any time.",
            ],
        },
        { type: "p", text: "Requests are sent to: ", email: INFO_EMAIL },
        { type: "h", text: "⌛ 7. Data storage" },
        { type: "p", text: "Data is stored for the time necessary for the operation of the service or in accordance with the requirements of the legislation of Ukraine." },
        { type: "h", text: "🌐 8. Links to third-party resources" },
        { type: "p", text: "The site may contain links to third-party sites. allure.net is not responsible for their privacy policies." },
        { type: "h", text: "🔞 9. Data of minors" },
        { type: "p", text: "The site is not intended for persons under 16 years of age. If such data has been provided, parents or guardians may apply for their deletion." },
        { type: "h", text: "✏️ 10. Changes to the Policy" },
        { type: "p", text: "The Administration has the right to change this Policy at any time. The current version is always posted on this page." },
        { type: "h", text: "⚖️ 11. Legislation" },
        { type: "p", text: "The Policy is governed by the legislation of Ukraine, in particular the Law of Ukraine \"On the Protection of Personal Data\"." },
        { type: "h", text: "📇 Contacts" },
        {
            type: "card",
            lines: [
                "For all questions regarding the processing of personal data:",
                { text: "📧 Email: ", email: ADMIN_EMAIL },
                { text: "🌐 Website: Allure.net", href: "/home" },
            ],
        },
    ],
};

const pro: SupportPageData = {
    slug: "pro-subscription",
    title: "PRO Subscription",
    blocks: [
        { type: "h", text: "PRO benefits" },
        {
            type: "card",
            lines: [
                "Upgrade to Allure Premium and unlock:",
                "1.Ad-Free Experience Enjoy music without interruptions. No ads on the website or in the app.",
                "2.Exclusive Account Status Stand out from the crowd with a unique premium badge on your profile.",
                "3.Instant Downloads No waiting times. Download tracks instantly without any delays or speed limits.",
                "4.Unlimited Access Remove all barriers. Listen and download as much music as you want with absolutely no restrictions.",
            ],
        },
        { type: "h", text: "How to connect PRO?" },
        {
            type: "card",
            lines: [
                "You can upgrade your account directly in the app or on the website. Just follow these simple steps:",
                "1.Initiate: Click the \"Pro Subscription\" button.",
                "2.Select Plan: Choose the subscription plan that suits you best.",
                "3.Purchase Code: Follow the link to purchase your activation promo code.",
                "4.Activate: Enter the code to start your premium access.",
            ],
        },
        { type: "h", text: "How to buy a promo code?" },
        {
            type: "card",
            lines: [
                "To buy a promo code, please follow these steps:",
                "1.Open the Bot: Go to our official Telegram Bot.",
                "2.Select Period: Choose the desired validity period for your subscription.",
                "3.Check Balance: Ensure your Telegram Wallet is topped up with the required amount.",
                "4.Payment: Complete the purchase using Telegram Stars.",
                "5.Activate: Copy the received code and enter it in the designated field on the website or app.",
            ],
        },
        { type: "p", text: "After successful payment, you will receive a promo code that can be used on our website." },
        { type: "p", text: "If you have any questions or difficulties, please contact our support service ", email: INFO_EMAIL },
    ],
};

const advertising: SupportPageData = {
    slug: "advertising",
    title: "📢 Advertisement on Allure.net",
    blocks: [
        { type: "p", text: "We are happy to cooperate with advertisers and offer effective tools for promoting your brand and products on our Allure.net platform." },
        { type: "p", text: "Using our advertising services means that the advertiser agrees to the terms of this policy and the rules for placing advertisements." },
        { type: "h", text: "🎯 1. Purpose of advertising" },
        {
            type: "card",
            lines: [
                "Allure provides advertisers with a powerful platform to:",
                "1.Reach a Targeted Audience: Capture the attention of our active and engaged music community.",
                "2.Boost Brand Awareness: Significantly increase visibility and recognition for your brand.",
                "3.Promote Effectively: Showcase your events, album releases, services, and products to the right people.",
            ],
        },
        { type: "h", text: "🔘 2. Advertising formats" },
        {
            type: "card",
            lines: [
                "We offer a diverse range of advertising solutions, including:",
                "1.Display Banners: High-visibility placements on the Homepage and internal pages.",
                "2.Native Advertising: Seamless integration within editorial content and music lists.",
                "3.Social Media & Telegram: Sponsored posts across our social networks and official Telegram channel.",
                "4.Special Projects: Custom promotions, brand partnerships, and interactive campaigns.",
            ],
        },
        { type: "h", text: "📋 3. Conditions of placement" },
        { type: "p", text: "All advertising materials must comply with the legislation of Ukraine and not violate the rights of third parties." },
        {
            type: "card",
            lines: [
                "To maintain a safe and high-quality environment, Allure strictly prohibits the promotion of:",
                "1.Unmarked Mature Content: Content intended for adults (18+) without appropriate age-restriction labels or warnings.",
                "2.Fraud & Deception: Fraudulent offers, scams, pyramid schemes, or misleading advertising claims.",
                "3.Hate Speech & Discrimination: Materials that promote hatred, harassment, or discrimination against any individual or group based on race, religion, gender, or other protected characteristics.",
            ],
        },
        { type: "p", text: "Allure.net reserves the right to refuse to place advertising without explanation." },
        { type: "p", text: "The advertiser is responsible for the accuracy of the information and materials provided." },
        { type: "h", text: "📊 4. Analytics and statistics" },
        {
            type: "card",
            lines: [
                "We believe in transparency and data-driven results:",
                "1.Performance Tracking: Advertisers receive access to detailed statistics, including impressions, clicks, and user interaction metrics.",
                "2.Privacy Compliance: All data is collected and stored in strict accordance with our Privacy Policy.",
                "3.Data Usage: Anonymized (depersonalized) data may be utilized for internal research and platform optimization purposes.",
            ],
        },
        { type: "h", text: "💰 5. Payment and terms of cooperation" },
        {
            type: "card",
            lines: [
                "Pricing & Payment Terms",
                "1.Custom Pricing: Placement rates are negotiated individually for each advertiser to ensure the best fit for your campaign goals.",
                "2.Payment Methods: All payments must be processed through official channels as mutually agreed upon with Allure.",
                "3.Violation Policy: In the event of a breach of our placement terms, Allure reserves the right to suspend or terminate the partnership immediately without refund.",
            ],
        },
        { type: "h", text: "📍 6. Contacts for advertisers" },
        {
            type: "card",
            lines: [
                "For all questions regarding advertising placements and partnerships on Allure, please contact our team:",
                { text: "📧 Email: ", email: ADMIN_EMAIL },
                { text: "🌐 Website: Allure.net", href: "/home" },
            ],
        },
    ],
};

// PLACEHOLDER: there is no User agreement page in the design. The text is neutral, replace it with the final one.
const userAgreement: SupportPageData = {
    slug: "user-agreement",
    title: "User Agreement",
    placeholder: true,
    blocks: [
        { type: "p", text: "This User Agreement (hereinafter referred to as the Agreement) governs the relationship between the Allure.net music online platform (hereinafter referred to as the Site, Administration) and the User of the Site." },
        { type: "p", text: "Using the Site means the User's full consent to this Agreement. If the User does not agree with the terms, he must stop using the Site." },
        { type: "h", text: "📌 1. General provisions" },
        {
            type: "card",
            lines: [
                "1.The Site provides the User with access to listening, uploading and sharing music content.",
                "2.The Administration may change this Agreement at any time. The current version is always posted on this page.",
                "3.The Agreement is governed by the legislation of Ukraine.",
            ],
        },
        { type: "h", text: "👤 2. Account" },
        {
            type: "card",
            lines: [
                "1.The User is responsible for the accuracy of the data provided during registration.",
                "2.The User is responsible for keeping the login details of the account confidential.",
                "3.The Administration may suspend an account that violates this Agreement.",
            ],
        },
        { type: "h", text: "🎵 3. Content" },
        {
            type: "card",
            lines: [
                "1.The User is solely responsible for the content he publishes on the Site.",
                "2.Publishing content that violates the rights of third parties or the legislation of Ukraine is prohibited.",
                "3.Copyright complaints are handled in accordance with the DMCA Policy.",
            ],
        },
        { type: "h", text: "📇 Contacts" },
        {
            type: "card",
            lines: [
                "For all questions regarding this Agreement:",
                { text: "📧 Email: ", email: INFO_EMAIL },
            ],
        },
    ],
};

export const SUPPORT_PAGES: SupportPageData[] = [
    userAgreement,
    rightsHolders,
    performers,
    dmca,
    privacy,
    pro,
    advertising,
];

export const getSupportPage = (slug?: string) =>
    SUPPORT_PAGES.find((page) => page.slug === slug);
