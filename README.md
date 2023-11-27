
[![Video Title](https://img.youtube.com/vi/PSuy54a5vRc/0.jpg)](https://www.youtube.com/watch?v=PSuy54a5vRc)


## Inspiration
Going to the same place as someone else to pickup something? We found that our neighbors were consistently visiting the same places as us. Whether that be safeway, costco, barnes and noble, or party city, we all visit the same places around the same times. What if there was a way to reduce times stuck in traffic or wandering a store?

## What it does
Parallel Pickup offers a simple solution to make delivery more efficient. If you already have a certain set of destinations planned out in a day, like getting groceries, buying clothes, etc., and other individuals need items from similar destinations, it would save time if one driver could buy and deliver the groceries or clothes for the other individuals. Parallel Pickup allows users to upload tasks to a web interface, after which, a driver can accept those tasks, and as the driver goes about their day-to-day stops, he can also pick up the items for the users along the route. Parallel Pickup is different than other apps like Doordash/Ubereats/Instacart, as it is not only flexible (any kind of delivery task, and time flexible), but also does not require drivers to deliberately or immediately go out of their way to deliver goods, but rather, pick them up at locations they are already headed towards. It is also different than other delivery services like Amazon, as our site allows users to post flexible tasks such as "make X prints at FedEx while you are already there and deliver it to Y location."

## How we built it
We used react frontend and node.js backend to create this web based application (see our github!). Using the inrix api, we created drive time polygons that allow users to see exactly how far they can travel from their intended destinations within a chosen time. We also use inrix for routing - we implemented the traveling salesman with precedence constraints algorithm using a nxn matrix which relies on making (n*n-n)/2 findRoute calls as well as a findRoute for the final optimal permutation of waypoints that would lead you to your final destination in the shortest time. 

## Challenges we ran into
We originally thought the UI would be the easiest part and the backend would be the most difficult, especially since we already had experience using google maps API, but it turned out to be the opposite. Using leaflet combined some of its poor documentation cost us many hours, and so did getting some of the dynamic react components to function properly. However, writing the backend and core algorithm code was much easier, which made up for the many hours we initially wasted.

## Accomplishments that we're proud of
Being able to code for 24 hours straight, and although some things didn't go as planned and the code was messy, it was great seeing our original idea we had come to fruition.

## What we learned
From this project, we were able to become more experienced with React, and we learned that coffee is a solid replacement for sleep.

## What's next for Parallel Pickup
The codebase is a mess. Right now, most of it is undocumented and distributed to whatever file was most convenient at the time. Once that's sorted out, we could our program to handle more complicated requests and implement monetization by taking a cut of the payment on the tasks. We would also like to implement some form of insurance for the drivers picking up the users, as well as creating a separate task interface for people that just want a delivery. Furthermore, our algorithm for TSP with PD solution was the most simple implementation; although TSP with PD itself is NP hard, some research papers have been able to use dp to increase the number of vertices up to > 30 compared to ours max ~10. We also plan to have the tasks expire after some point.
