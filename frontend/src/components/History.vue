/** This component should show user history like:
- What quiz theyve taken
- What time they got on the quiz
- What day the did the quiz
- How many correct vs wrong answers
- How much XP they gained


This component should also:
- be a compact widget that is shown on users personal page.
- be its own page that shows more info than the compact widget.
*/


<template>
  <section class="history">
        <h1>History</h1>
        <h2>Your history</h2>

        <!-- History table-->

        <table>
          <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Difficulty</th>
            <th>Score</th>
            <th>Max Score</th>
            <th>Time</th>

          </tr>
          </thead>
          <tbody>
          <tr>
            <!-- The data goeeess heereee-->
            <td>Date</td>
            <td>Category</td>
            <td>Difficulty</td>
            <td>Score</td>
            <td>Max Score</td>
            <td>Time</td>
            
          </tr>
          </tbody>

          <!-- Lil summary maybe-->
          <tfoot>
            <tr>
              <th>Total time</th>
              <th>Total score</th>
            </tr>
          </tfoot>
        </table>

        <!-- Message for empty history users-->

  </section>
</template>

<style scoped>

</style>