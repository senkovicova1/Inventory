import {createStackNavigator, createAppContainer} from 'react-navigation';
import DetailRecipe from './components/detailRecipe';
import ListRecipes from './components/listRecipes';

const MainNavigator = createStackNavigator({
  Home: {screen: DetailRecipe},
  Profile: {screen: ListRecipes},
});

const Navigator = createAppContainer(MainNavigator);

export default Navigator;
