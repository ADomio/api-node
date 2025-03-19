import {PrismaClient} from '@prisma/client';
const prisma = new PrismaClient();

interface TrafficSource {
  name: string,
  queryParams: {}[]
}

const trafficSources: TrafficSource[] = [
  { name: "push.house",
    queryParams: [{
      click_id: "Click ID",
      site: "Site ID",
      camp: "Creo ID",
      pdpid: "Subscribe ID",
      price: "Price",
      feed: "Feed",
      country: "Country",
      city: "City",
      os: "OS",
      browser: "Browser",
      format: "Format",
      lang: "Language",
      user_activity: "Activity of traffic"
    }]
  },

]

async function main() {
  for (const source of trafficSources) {
    const createdSource = await prisma.trafficSource.create({
      data: source
    })
    console.log(`Source ${source.name} with id ${createdSource.id} added to the database`)
  }
}

main()