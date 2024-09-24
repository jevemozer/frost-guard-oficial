import TotalMaintenances from '@/components/dashboard/TotalMaintenances';
import MaintenancesByEquipment from '@/components/dashboard/MaintenancesByEquipment';
import TotalCost from '@/components/dashboard/TotalCost';
import CostByMonth from '@/components/dashboard/CostByMonth';
import CostByEquipment from '@/components/dashboard/CostByEquipment';
import CostByProblemGroup from '@/components/dashboard/CostByProblemGroup';
import AverageCostByProblemGroup from '@/components/dashboard/AverageCostByProblemGroup';
import CostByCostCenter from '@/components/dashboard/CostByCostCenter';
import Top20CostlyEquipment from '@/components/dashboard/Top20CostlyEquipment';
import Top20MostMaintainedEquipment from '@/components/dashboard/Top20MostMaintainedEquipment';

const Dashboard = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
      <TotalCost />
      <CostByMonth />
      <TotalMaintenances />
      <MaintenancesByEquipment />
      <CostByEquipment />
      <CostByProblemGroup />
      <AverageCostByProblemGroup />
      <CostByCostCenter />
      <Top20CostlyEquipment />
      <Top20MostMaintainedEquipment />
    </div>
  );
};

export default Dashboard;
