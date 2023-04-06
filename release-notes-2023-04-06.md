# Release Notes

This week's releases bring a mix of new features, improvements, and fixes that enhance the overall user experience and address some of the issues faced by our users. We've focused on enhancing the frontend, optimizing performance, and refining the editor.

## New Features

* **Add link to queue page in sidebar**: A new link has been added to the sidebar for easier access to the queue page.
* **Add button to create new draft on mobile**: A new button has been added for mobile users, making it easier to create new drafts while on-the-go.

## Improvements

* **Enforce aspect ratio in blog thumbnails**: Improved the frontend by enforcing the aspect ratio of blog thumbnails.
* **Make "edit team" more explicit**: Enhanced the frontend by making the "edit team" option more prominent and clear.
* **Allow mobile users to undo tweet deletion**: Mobile users can now undo tweet deletion, improving the overall user experience.
* **It's not clear why I can't add a thread finisher if there is only one tweet in the thread**: Added a more informative tooltip on the button to clarify this situation.

## Fixes

* **Timezone issues break streak for @eurunuela**: Resolved an issue where timezone inconsistencies were breaking the streak for @eurunuela.
* **Daily Followers broken in daily mode**: Fixed an issue where the daily followers count was not displaying correctly.
* **Leaving team doesn't make it disappear from Accounts menu**: Fixed an issue where leaving a team did not remove it from the Accounts menu.
* **Clicking "+ Add content" button in your profile page results in an error**: Resolved an error that occurred when clicking the "+ Add content" button in the user profile page.
* **RSS button in profile tooltip glitch**: Fixed a glitch related to the RSS button in the profile tooltip.
* **Heatmap graphs should not scroll vertically**: Resolved a frontend issue where heatmap graphs were scrolling vertically.
* **Editor error banner is stretched**: Fixed a frontend issue where the editor error banner was stretched and not centered.
* **Add "logged in as" row when the main account is in a team**: Added a row to show which account the user is logged in as when the main account is part of a team.
* **User should be logged out when receiving a 401**: Fixed an issue where users were not logged out after receiving a 401 error.
* **Requests timeout, API server unable to keep up**: Addressed an issue where the API server was unable to keep up with multiple requests.
* **FocusTrap is crashing on mobile**: Resolved a frontend issue where FocusTrap was crashing on mobile devices.
* **Punchier AI is glitching**: Fixed a glitch related to the Punchier AI feature.
* **Refactor Streaks calls with useQuery and staleTime**: Optimized Streak calls by refactoring them with useQuery and staleTime.

---

* **Don't track affiliates when FB/Google adv**: Internal fix to stop tracking affiliates when using Facebook or Google advertising.
* **Remove rust from Dockerfile and use newly released tiktoken**: Internal update to remove rust from Dockerfile and use the latest version of tiktoken.
* **Since switch to React Query, we retry on invalid token instead of showing the login modal**: Login modal issue resolved, but it may take a while to show up.
* **Transfer subscription script fails when two users with the same screen_name exist in the system**: An issue with the transfer subscription script when two users have the same screen_name.
* **Shared Draft page flashes the "made with Typefully footer when loading**: A visual glitch where the "made with Typefully" footer flashes on the Shared Draft page while loading.
* **Tweets deleted after posting**: Investigating an issue where scheduled tweets are not being published.
* **Visual glitch in prompts div**: Fixed a visual glitch in the prompts div.
* **Empty editor actions overlap**: Resolved an issue where empty editor actions overlap on mobile devices.
* **Quote text is bigger than tweet text on mobile**: Fixed an issue where quote text appeared larger than tweet text on mobile devices.
* **Prompt and AI idea button not sticking to the bottom of the editor**: Addressed an issue where the prompt and AI idea button were not sticking to the bottom of the editor.
* **Tweets being deleted situation**: Investigating a situation where tweets are being deleted.
* **Show in-app notice**: An in-app notice has been added.
* **Help Menu and Notifications overflow the viewport on mobile**: Fixed an issue where the Help Menu and Notifications were overflowing the viewport on mobile devices.
* **Thread publishing failed for svpino**: Investigating an issue with thread publishing for a specific user.
* **Send tweet out warning users**: A warning has been sent out to users.
* **Create help page**: A new help page has been created.
* **Can't access auto-plug and auto-rt settings after publishing**: Resolved an issue where users could not access auto-plug and auto-rt settings after publishing.
* **Missing "View on Typefully" button in published drafts**: Fixed an issue where the "View on Typefully" button was missing in published drafts.
* **With "edit image modal" open, you should not be able to edit the Thread text**: Fixed an issue where users could edit thread text while the "edit image modal" was open.
* **Deleting a tweet shouldn’t focus the editor**: Resolved an issue where deleting a tweet would cause the editor to be focused.
* **Bigger "create team" affordance, contextual "add account" buttons**: Improved the visibility of the "create team" option and added contextual "add account" buttons for better user experience.