import { PrismaClient, Statuses, FilterTypes, FilterOperations, Currencies } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.campaignProfit.deleteMany();
  await prisma.campaignExpense.deleteMany();
  await prisma.filter.deleteMany();
  await prisma.stream.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.trafficSource.deleteMany();

  // Create traffic sources
  const facebook = await prisma.trafficSource.create({
    data: {
      name: 'Facebook',
      queryParams: {
        utm_source: 'facebook',
        utm_medium: 'cpc',
        utm_campaign: 'required'
      },
      custom: false
    }
  });

  const google = await prisma.trafficSource.create({
    data: {
      name: 'Google Ads',
      queryParams: {
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'required'
      },
      custom: false
    }
  });

  // Create campaigns
  const summerCampaign = await prisma.campaign.create({
    data: {
      name: 'Summer Sale 2024',
      code: 'SUMMER24',
      status: Statuses.active,
      currency: Currencies.usd,
      trafficSourceId: facebook.id
    }
  });

  const winterCampaign = await prisma.campaign.create({
    data: {
      name: 'Winter Special 2024',
      code: 'WINTER24',
      status: Statuses.active,
      currency: Currencies.usd,
      trafficSourceId: google.id
    }
  });

  // Create streams for Summer Campaign
  const summerStream1 = await prisma.stream.create({
    data: {
      name: 'US Desktop Users',
      targetUrl: 'https://example.com/summer/us-desktop',
      status: Statuses.active,
      weight: 30,
      campaignId: summerCampaign.id
    }
  });

  const summerStream2 = await prisma.stream.create({
    data: {
      name: 'US Mobile Users',
      targetUrl: 'https://example.com/summer/us-mobile',
      status: Statuses.active,
      weight: 20,
      campaignId: summerCampaign.id
    }
  });

  const summerStream3 = await prisma.stream.create({
    data: {
      name: 'UK Users',
      targetUrl: 'https://example.com/summer/uk',
      status: Statuses.active,
      weight: 15,
      campaignId: summerCampaign.id
    }
  });

  const summerStream4 = await prisma.stream.create({
    data: {
      name: 'Rest of World',
      targetUrl: 'https://example.com/summer/row',
      status: Statuses.active,
      weight: 35,
      campaignId: summerCampaign.id
    }
  });

  // Create filters for Summer Campaign streams
  await prisma.filter.createMany({
    data: [
      // US Desktop Users filters
      {
        streamId: summerStream1.id,
        type: FilterTypes.country,
        operation: FilterOperations.equals,
        value: 'US'
      },
      {
        streamId: summerStream1.id,
        type: FilterTypes.device,
        operation: FilterOperations.equals,
        value: 'desktop'
      },
      // US Mobile Users filters
      {
        streamId: summerStream2.id,
        type: FilterTypes.country,
        operation: FilterOperations.equals,
        value: 'US'
      },
      {
        streamId: summerStream2.id,
        type: FilterTypes.device,
        operation: FilterOperations.equals,
        value: 'mobile'
      },
      // UK Users filters
      {
        streamId: summerStream3.id,
        type: FilterTypes.country,
        operation: FilterOperations.equals,
        value: 'UK'
      },
      // Rest of World filters (no country filters)
      {
        streamId: summerStream4.id,
        type: FilterTypes.country,
        operation: FilterOperations.not_equals,
        value: 'US,UK'
      }
    ]
  });

  // Create streams for Winter Campaign
  const winterStream1 = await prisma.stream.create({
    data: {
      name: 'Chrome Users',
      targetUrl: 'https://example.com/winter/chrome',
      status: Statuses.active,
      weight: 40,
      campaignId: winterCampaign.id
    }
  });

  const winterStream2 = await prisma.stream.create({
    data: {
      name: 'Firefox Users',
      targetUrl: 'https://example.com/winter/firefox',
      status: Statuses.active,
      weight: 30,
      campaignId: winterCampaign.id
    }
  });

  const winterStream3 = await prisma.stream.create({
    data: {
      name: 'Safari Users',
      targetUrl: 'https://example.com/winter/safari',
      status: Statuses.active,
      weight: 30,
      campaignId: winterCampaign.id
    }
  });

  // Create filters for Winter Campaign streams
  await prisma.filter.createMany({
    data: [
      // Chrome Users filters
      {
        streamId: winterStream1.id,
        type: FilterTypes.browser,
        operation: FilterOperations.contains,
        value: 'Chrome'
      },
      // Firefox Users filters
      {
        streamId: winterStream2.id,
        type: FilterTypes.browser,
        operation: FilterOperations.contains,
        value: 'Firefox'
      },
      // Safari Users filters
      {
        streamId: winterStream3.id,
        type: FilterTypes.browser,
        operation: FilterOperations.contains,
        value: 'Safari'
      }
    ]
  });

  // Create some campaign expenses and profits for testing
  await prisma.campaignExpense.createMany({
    data: [
      {
        campaignId: summerCampaign.id,
        amount: 1000.50
      },
      {
        campaignId: winterCampaign.id,
        amount: 750.25
      }
    ]
  });

  await prisma.campaignProfit.createMany({
    data: [
      {
        campaignId: summerCampaign.id,
        amount: 2500.75
      },
      {
        campaignId: winterCampaign.id,
        amount: 1800.50
      }
    ]
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 