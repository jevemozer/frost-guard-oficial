import TotalMaintenances from '@/components/dashboard/TotalMaintenances';
import MaintenancesByEquipment from '@/components/dashboard/MaintenancesByEquipment';
import MaintenancesByProblemGroup from '@/components/dashboard/MaintenancesByProblemGroup';
import TotalCost from '@/components/dashboard/TotalCost';
import CostByMonth from '@/components/dashboard/CostByMonth';
import CostByEquipment from '@/components/dashboard/CostByEquipment';
import CostByProblemGroup from '@/components/dashboard/CostByProblemGroup';
import AverageCostByProblemGroup from '@/components/dashboard/AverageCostByProblemGroup';
import MaintenancesCountByProblemGroup from '@/components/dashboard/MaintenancesCountByProblemGroup';
import Top20CostlyEquipment from '@/components/dashboard/Top20CostlyEquipment';
import Top20MostMaintainedEquipment from '@/components/dashboard/Top20MostMaintainedEquipment';

const Dashboard = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <TotalMaintenances />
      <MaintenancesByEquipment />
      <MaintenancesByProblemGroup />
      <TotalCost />
      <CostByMonth />
      <CostByEquipment />
      <CostByProblemGroup />
      <AverageCostByProblemGroup />
      <MaintenancesCountByProblemGroup />
      <Top20CostlyEquipment />
      <Top20MostMaintainedEquipment />
    </div>
  );
};

export default Dashboard;
