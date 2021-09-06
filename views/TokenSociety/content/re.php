<div id='content' style="text-align: center;">
	<h1><?php echo Q::interpolate($welcome['About'])?></h1>
	<p><?php echo Q::interpolate($welcome['Provenance']) ?></p>
	<p><?php echo Q::interpolate($welcome['Commissions'], array(ceil(Q::milliseconds()))) ?></p>
	
	<button class="Q_button Catalogs_connect_wallet" style="padding: 30px;">
		<?php echo $assets['ConnectWallet'] ?>
	</button>
</div>
