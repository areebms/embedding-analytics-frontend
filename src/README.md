# LineChart Component - Refactored Structure

This is a properly componentized version of the LineChart component following React best practices.

## File Structure

```
├── LineChart-refactored.jsx    # Main orchestrator component
├── SimilarityScatterChart.jsx  # Scatter chart presentation component
├── ChartLoading.jsx            # Loading state component
├── ChartError.jsx              # Error state component
├── DataTable.jsx               # Data table component (existing)
├── useSimilarityData.js        # Custom hook for data fetching
├── useChartConfig.js           # Custom hook for chart configuration
├── termLabelPlugin.js          # Chart.js custom plugin
├── constants.js                # Shared constants
├── utils.js                    # Helper functions
└── index.js                    # Public exports
```

## Component Hierarchy

```
LineChart (Container)
├── ChartLoading (Loading State)
├── ChartError (Error State)
└── Main Content
    ├── SimilarityScatterChart (Chart Display)
    └── DataTable (Table Display)
```

## Design Principles Applied

### 1. **Separation of Concerns**
- **Container Component** (`LineChart-refactored.jsx`): Manages state and orchestrates child components
- **Presentation Components**: Focus solely on rendering UI
- **Custom Hooks**: Encapsulate business logic and side effects
- **Utilities**: Pure functions with no side effects

### 2. **Single Responsibility**
- Each file has one clear purpose
- Components are focused and easy to test
- Hooks handle specific concerns (data fetching, configuration)

### 3. **Reusability**
- `ChartLoading` and `ChartError` can be used anywhere
- `termLabelPlugin` is a standalone Chart.js plugin
- Custom hooks can be used in other chart components
- Constants and utilities are easily shareable

### 4. **Testability**
- Pure functions in `utils.js` are easy to unit test
- Components receive props, making them testable in isolation
- Custom hooks can be tested with `@testing-library/react-hooks`
- Plugin logic is separated and can be tested independently

### 5. **Maintainability**
- Clear file organization
- Each piece has a single purpose
- Easy to locate and modify specific functionality
- Changes to one part don't ripple through the codebase

## Usage

```jsx
import { LineChart } from './components/LineChart';

function App() {
  return <LineChart apiBaseUrl="/api" />;
}
```

## Component Details

### LineChart (Main Container)
- Orchestrates all sub-components
- Manages corpus selection state
- Delegates data fetching to `useSimilarityData`
- Delegates configuration to `useChartConfig`
- Handles conditional rendering based on loading/error states

### SimilarityScatterChart
- Pure presentation component
- Renders the Chart.js scatter plot
- Accepts configuration via props
- Includes accessibility attributes

### ChartLoading & ChartError
- Simple state components
- Reusable across the application
- Proper ARIA roles for accessibility

### Custom Hooks

#### useSimilarityData
- Handles API calls
- Manages loading and error states
- Transforms raw data into chart format
- Returns: `{ chartData, tableData, loading, error }`

#### useChartConfig
- Manages all chart configuration
- Handles legend interactions
- Memoizes expensive computations
- Returns: Complete Chart.js options object

### termLabelPlugin
- Custom Chart.js plugin
- Draws term labels on rightmost points
- Draws connecting lines from y-axis
- Self-contained with private helper methods

### Constants & Utilities
- **constants.js**: Configuration values used across components
- **utils.js**: Pure helper functions for data transformation

## Benefits of This Structure

1. **Easy Testing**: Each piece can be tested in isolation
2. **Clear Dependencies**: Import statements show relationships
3. **Better Performance**: Memoization is more effective with smaller components
4. **Easier Debugging**: Smaller files are easier to reason about
5. **Team Collaboration**: Multiple developers can work on different files
6. **Future Extensions**: Easy to add new chart types or features

## Migration from Original

To migrate from the original single-file component:

1. Replace the import:
   ```jsx
   // Before
   import { LineChart } from './LineChart';
   
   // After
   import { LineChart } from './LineChart-refactored';
   ```

2. The API remains the same - no changes needed to consuming code!

## Next Steps for Further Improvement

1. Add TypeScript for type safety
2. Add unit tests for each component
3. Add integration tests for the full component
4. Consider using Context API if passing many props
5. Add error boundaries for better error handling
6. Implement retry logic for failed API calls
