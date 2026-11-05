import LegalDoc, { type Section } from "@/components/pages/legal/LegalDoc";

const SECTIONS: Section[] = [
  {
    id: "what-this-page-covers",
    title: "What this page covers",
    blocks: [
      {
        type: "para",
        text: "This page explains how to have Yugty delete the personal data it holds about you. It covers both your Yugty account and any Instagram or LinkedIn account you have connected to Yugty. You can ask Yugty to delete everything, or only the data associated with one connected account while your Yugty account stays open.",
      },
    ],
  },
  {
    id: "how-to-request-deletion",
    title: "How to request deletion",
    blocks: [
      {
        type: "para",
        text: "Send an email to support@growqr.ai with the exact subject line “Data deletion request”. So that Yugty can locate and verify your records, include the following in the message:",
      },
      {
        type: "list",
        items: [
          "the email address on your Yugty account;",
          "whether you want your entire Yugty account deleted, or only a connected account removed;",
          "if you want only a connected account removed, the Instagram username or the LinkedIn profile URL in question.",
        ],
      },
      {
        type: "para",
        text: "Yugty verifies that the request comes from the account holder before acting on it, and may ask you to confirm the request from the email address registered on the account. This step protects you against someone else requesting deletion of your data.",
      },
    ],
  },
  {
    id: "what-growqr-deletes",
    title: "What Yugty deletes",
    blocks: [
      {
        type: "para",
        text: "On a verified request, Yugty deletes the following from its systems:",
      },
      {
        type: "list",
        items: [
          "the access token issued by Instagram or LinkedIn for the connected account, which immediately ends Yugty’s ability to reach that account;",
          "the connected account details Yugty stored, including the Instagram account ID, username, account type, profile picture, follower count and media count, and the LinkedIn name, headline, profile picture and email address;",
          "the media details Yugty stored for the connected Instagram account, including media type, permalink, timestamp, and like and comment counts;",
          "the Instagram performance metrics Yugty stored to produce your reporting;",
          "drafts, generated content and scheduled posts that have not yet been published;",
          "the record Yugty keeps of posts it published on your behalf;",
          "where you asked for your whole account to be deleted, your Yugty profile, career data, session recordings and derived scores, as described in the Privacy Policy.",
        ],
      },
    ],
  },
  {
    id: "what-cannot-be-deleted",
    title: "What Yugty cannot delete",
    blocks: [
      {
        type: "list",
        items: [
          {
            term: "Posts already published",
            text: "content published to Instagram or LinkedIn lives on those platforms, not on Yugty. Deleting your Yugty data does not remove it. You need to delete those posts from within Instagram or LinkedIn yourself.",
          },
          {
            term: "Data held by Instagram and LinkedIn",
            text: "each platform keeps its own records under its own privacy policy. Yugty has no ability to delete data from Meta’s or LinkedIn’s systems, and you should use their tools for that.",
          },
          {
            term: "Aggregated and anonymised data",
            text: "information that has already been aggregated or anonymised so that it can no longer be linked back to you is not deleted, because it is no longer personal data.",
          },
          {
            term: "Records Yugty must retain",
            text: "a limited set of records, such as transaction and tax records, is retained where law requires it. These are kept only for the period the relevant law prescribes and are not used for any other purpose.",
          },
        ],
      },
    ],
  },
  {
    id: "how-long-it-takes",
    title: "How long it takes",
    blocks: [
      {
        type: "para",
        text: "Yugty completes deletion within thirty (30) days of verifying your request, and confirms by email once it is done. Revocation of Yugty’s access to a connected Instagram or LinkedIn account takes effect as soon as the request is verified, rather than at the end of that period.",
      },
    ],
  },
  {
    id: "disconnecting-without-deleting",
    title: "Disconnecting without deleting",
    blocks: [
      {
        type: "para",
        text: "If you only want Yugty to stop accessing a connected account, you can revoke access directly from the platform, without sending a deletion request. On Instagram, remove Yugty from the apps and websites section of your account settings. On LinkedIn, open the Me menu, then Settings & Privacy, then Data privacy, then Other applications, then Permitted services, and remove Yugty.",
      },
      {
        type: "para",
        text: "Revoking access stops Yugty from reading anything further or publishing anything further, and it takes effect immediately. It does not by itself delete the data Yugty already holds. To have that data deleted, send the email described above.",
      },
    ],
  },
  {
    id: "contact",
    title: "Contact",
    blocks: [
      {
        type: "details",
        rows: [
          { label: "Deletion requests", value: "support@growqr.ai", email: true },
          { label: "Subject line", value: "Data deletion request" },
          { label: "Grievance Officer", value: "Yugty Private Limited" },
          {
            label: "Delhi NCR Office",
            value: "4th Floor, Wesource Building, Plot No. 8, Sector 125, Noida, Uttar Pradesh 201313",
          },
        ],
      },
      {
        type: "link",
        prefix: "For the full detail of what Yugty collects and why, including the exact permissions requested from Instagram and LinkedIn, see the",
        href: "/privacy-policy",
        label: "Privacy Policy",
        suffix: ".",
      },
    ],
  },
];

export default function DataDeletionPage() {
  return (
    <LegalDoc
      title="Data Deletion"
      intro="How to ask Yugty to delete your data, including data from a connected Instagram or LinkedIn account, what gets deleted, and how long it takes."
      lastUpdated="August 26, 2026"
      governingLaw="DPDP Act, 2023 (India)"
      sections={SECTIONS}
    />
  );
}
