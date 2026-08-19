# Royal Bloom Invites

Build a premium luxury wedding invitation web application for Parth & Namrata.

This is NOT a generic wedding website.

The experience should feel like opening a handcrafted royal Indian wedding invitation.

The app will primarily be opened from WhatsApp on mobile devices, so mobile-first design is the highest priority.

Use the uploaded reference images as the visual benchmark.

Do not redesign them.

Extract their visual language and recreate the same premium feel while making the UI unique.

====================================================

PRIMARY USER JOURNEY

====================================================

Guest receives WhatsApp link

↓

Opens website

↓

Luxury envelope animation

↓

Invitation card comes out of envelope

↓

Wedding information

↓

Celebration schedule

↓

Venue

↓

RSVP

↓

Success message

====================================================

DESIGN STYLE

====================================================

Theme:

Luxury Indian Wedding

Feel:

Premium

Elegant

Romantic

Royal

Minimal

Modern

High-end

Timeless

Color Palette:

Background:

Warm Ivory (#FBF5EB)

Primary:

Deep Burgundy (#7A1E33)

Accent:

Royal Gold (#C8A04A)

Text:

Charcoal (#2D2D2D)

Secondary:

Warm Grey (#8E857C)

Use:

• Paper texture

• Gold foil accents

• Fine floral borders

• Lotus illustrations

• Palace architecture line art

• Floating rose petals

• Elegant dividers

• Premium shadows

• Soft lighting

Avoid:

• Generic wedding templates

• Bright gradients

• Cartoon styling

• Heavy decorations

• Glassmorphism

• Neon colors

• Large empty spaces

====================================================

SCREEN 1

Envelope Experience

====================================================

The first screen should NOT look like a website.

It should look like a premium invitation.

Layout:

Top right

Skip Invitation button

Center

Luxury P&N monogram

Below

"You Are Cordially Invited"

Small elegant subtitle

"to celebrate our wedding"

Main element

Large luxury burgundy envelope

The envelope should occupy around 70% of screen width.

Do NOT make the envelope small.

The envelope should include

• Gold borders

• Premium texture

• Wax seal

• Floral embossing

• Layered folds

• Realistic depth

Under the envelope

"A Special Invitation Awaits You"

Button

Tap To Open

The button should feel integrated with the envelope.

====================================================

ANIMATION

====================================================

When user taps

Wax seal glows

↓

Seal breaks

↓

Envelope flap opens

↓

Invitation slides upward

↓

Names fade in

↓

Background softly brightens

↓

Page scroll unlocks

Animations must feel elegant.

No bouncing.

No overshooting.

====================================================

SCREEN 2

Invitation

====================================================

Large invitation card.

Include

Together with our families

Parth

&

Namrata

Invite you to celebrate their wedding

24 & 25 February 2027

Quote

"Two beautiful days filled with love, laughter and celebrations."

Live countdown

Days

Hours

Minutes

Seconds

Primary button

View Celebrations

Floating RSVP button

====================================================

SCREEN 3

Celebration Timeline

====================================================

Tabs

Day 1

Day 2

Timeline cards.

Day 1

Haldi & Pool Party

Lunch

High Tea

Sangeet

Dinner

Day 2

Breakfast

Lunch

Baraat

Wedding

Reception

Dinner

Each event card should contain

Icon

Time

Title

Short description

====================================================

SCREEN 4

Venue

====================================================

Luxury venue card

Venue image placeholder

Venue name

Address

View on Maps

Call contact

====================================================

SCREEN 5

RSVP

====================================================

Beautiful premium form

Fields

Full Name

Mobile

Will you attend?

Options

Yes

Some family members

Not sure

Cannot attend

Adults

Children

Which day?

24

25

Both

Travel city

Travel mode

Accommodation

Arrival date

Message

Large submit button

====================================================

SUCCESS SCREEN

====================================================

Elegant thank you message

Guest name

Attendance summary

Edit Response

Share Invitation

====================================================

RESPONSIVENESS

====================================================

Must be perfect on

390px

430px

768px

1024px

1440px

Desktop should use a centered invitation canvas.

Do NOT stretch content across the full browser width.

====================================================

TECH STACK

====================================================

Next.js

TypeScript

TailwindCSS

Framer Motion

Supabase

React Hook Form

Zod

====================================================

DATABASE

====================================================

Create Supabase tables

invitation_groups

rsvp_responses

Allow public RSVP submission.

Protect admin routes.

====================================================

ADMIN

====================================================

Create admin dashboard

Summary

Responses

Invitation Groups

Export CSV

Search

Filters

Pending RSVP

====================================================

QUALITY

====================================================

This must NOT feel like a website.

It must feel like a luxury invitation.

Use the uploaded reference images as the source of truth.

Recreate the same visual richness.

Do not simplify.

Do not replace artwork with placeholders.

Do not invent another design language.

Everything should feel handcrafted.

Typography should feel premium.

Spacing should feel luxurious.

Envelope should dominate the first screen.

The emotional impact of the opening animation is more important than adding extra features.

Before generating code:

1. Analyze the uploaded reference images.

2. Create a design system.

3. Build reusable components.

4. Then implement the application.

Do not rush into coding.

Aim for Apple-level polish and luxury wedding invitation quality.

## Development

You need Node.js and npm:

```sh
npm install
npm run dev
```
